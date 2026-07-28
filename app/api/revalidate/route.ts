import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

type WebhookPayload = {
  _type: string;
  _id?: string;
};

/**
 * Sanity webhook target. Verifies the GROQ-powered webhook signature
 * (mandatory — an unauthenticated revalidation endpoint is a DoS vector),
 * then invalidates the cache tag matching the changed document's `_type`.
 *
 * Every path logs server-side so the host's runtime logs can distinguish
 * "the webhook never fired" from "it fired but was rejected" from "it fired
 * and revalidated tag X". See WEBHOOK-SETUP.md for the Sanity-side setup.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    console.error("[revalidate] rejected: SANITY_REVALIDATE_SECRET is not set on this host");
    return NextResponse.json(
      { message: "Server misconfigured" },
      { status: 500 },
    );
  }

  try {
    const { isValidSignature, body } = await parseBody<WebhookPayload>(
      req,
      secret,
    );

    if (!isValidSignature) {
      console.error(
        "[revalidate] rejected: invalid signature — the webhook Secret in sanity.io/manage " +
          "does not match SANITY_REVALIDATE_SECRET on this host (check for stray whitespace)",
      );
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 401 },
      );
    }

    if (!body?._type) {
      console.error(
        "[revalidate] rejected: payload has no _type — the Sanity webhook is using a " +
          "custom projection that omits it; leave the projection empty",
      );
      return NextResponse.json(
        { message: "Missing _type in webhook payload" },
        { status: 400 },
      );
    }

    // `expire: 0` = immediate invalidation: the next request blocks on one
    // fresh Sanity fetch instead of serving stale HTML once ("max"/SWR).
    // Chosen so a non-technical editor sees their publish on first reload.
    revalidateTag(body._type, { expire: 0 });
    console.log(
      `[revalidate] ok: revalidated tag "${body._type}"` +
        (body._id ? ` (document ${body._id})` : ""),
    );
    return NextResponse.json({
      revalidated: true,
      tag: body._type,
    });
  } catch (error) {
    console.error("[revalidate] webhook processing failed:", error);
    return NextResponse.json(
      { message: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

/**
 * Deployment check only — lets the owner paste the URL into a browser and
 * confirm the endpoint exists before debugging anything deeper. Never
 * revalidates anything and never reveals secret values.
 */
export async function GET() {
  return NextResponse.json({
    route: "/api/revalidate",
    deployed: true,
    revalidateSecretPresent: Boolean(process.env.SANITY_REVALIDATE_SECRET),
    note:
      "This endpoint only accepts signed POST requests from a Sanity webhook. " +
      "See WEBHOOK-SETUP.md in the project for how to create that webhook.",
  });
}
