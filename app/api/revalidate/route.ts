import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

type WebhookPayload = {
  _type: string;
};

/**
 * Sanity webhook target. Verifies the GROQ-powered webhook signature
 * (mandatory — an unauthenticated revalidation endpoint is a DoS vector),
 * then invalidates the cache tag matching the changed document's `_type`.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    console.error("[revalidate] SANITY_REVALIDATE_SECRET is not set");
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
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 401 },
      );
    }

    if (!body?._type) {
      return NextResponse.json(
        { message: "Missing _type in webhook payload" },
        { status: 400 },
      );
    }

    // `expire: 0` = immediate invalidation: the next request blocks on one
    // fresh Sanity fetch instead of serving stale HTML once ("max"/SWR).
    // Chosen so a non-technical editor sees their publish on first reload.
    revalidateTag(body._type, { expire: 0 });
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
