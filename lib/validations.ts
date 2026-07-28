import { z } from "zod";

const phonePattern = /^[+()\-.\s\d]{7,20}$/;

/** Hero "Need Plumbing Assistance?" form. */
export const emergencyContactSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "Please enter your first name (at least 2 characters)."),
  lastName: z
    .string()
    .trim()
    .min(2, "Please enter your last name (at least 2 characters)."),
  email: z.string().trim().email("Please enter a valid email address."),
  phone: z
    .string()
    .trim()
    .min(1, "Please enter a phone number.")
    .regex(phonePattern, "Please enter a valid phone number."),
  company: z.string().trim().optional(),
  service: z.string().min(1, "Please select the service you need."),
  message: z
    .string()
    .trim()
    .min(10, "Please describe the issue (at least 10 characters)."),
});

export type EmergencyContactValues = z.infer<typeof emergencyContactSchema>;

/** Compact final-CTA quote form. */
export const quoteRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name (at least 2 characters)."),
  phone: z
    .string()
    .trim()
    .min(1, "Please enter a phone number.")
    .regex(phonePattern, "Please enter a valid phone number."),
  email: z.string().trim().email("Please enter a valid email address."),
  company: z.string().trim().optional(),
  message: z
    .string()
    .trim()
    .min(10, "Please tell us a little about what you need (at least 10 characters)."),
});

export type QuoteRequestValues = z.infer<typeof quoteRequestSchema>;

/** /contact page form — urgency drives the emergency call-now callout. */
export const URGENCY_OPTIONS = [
  { value: "emergency", label: "Emergency — need someone now" },
  { value: "urgent", label: "Urgent — within 24 hours" },
  { value: "scheduled", label: "Scheduled — this week" },
  { value: "planning", label: "Planning & budgeting" },
] as const;

export const CONTACT_METHOD_OPTIONS = [
  { value: "phone", label: "Phone" },
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
] as const;

export const PROPERTY_TYPE_OPTIONS = [
  "Apartment / multi-family",
  "Commercial or office",
  "Retail or restaurant",
  "Industrial or warehouse",
  "HOA or condo",
  "Municipal or school",
  "Other",
] as const;

export const REFERRAL_OPTIONS = [
  "Google search",
  "Referral from a colleague",
  "Vendor platform (VendorCafe, RealPage, …)",
  "Existing customer",
  "Other",
] as const;

/** Full /contact quote form. Only five fields are required by design. */
export const contactQuoteSchema = z.object({
  service: z.string().min(1, "Please select the service you need."),
  propertyType: z.string().trim().optional(),
  location: z.string().trim().optional(),
  urgency: z.enum(["emergency", "urgent", "scheduled", "planning"]),
  message: z
    .string()
    .trim()
    .min(10, "Please describe the work (at least 10 characters)."),
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name (at least 2 characters)."),
  company: z.string().trim().optional(),
  phone: z
    .string()
    .trim()
    .min(1, "Please enter a phone number.")
    .regex(phonePattern, "Please enter a valid phone number."),
  email: z.string().trim().email("Please enter a valid email address."),
  contactMethod: z.enum(["phone", "text", "email"]),
  referral: z.string().trim().optional(),
});

export type ContactQuoteValues = z.infer<typeof contactQuoteSchema>;

/**
 * Any lead the /api/contact endpoint accepts — the three live forms. The
 * server re-validates with this union; the client schemas above are UX only.
 */
export const leadSchema = z.union([
  contactQuoteSchema,
  emergencyContactSchema,
  quoteRequestSchema,
]);

// Module-evaluation time in the browser ≈ when the visitor's page loaded.
// Sent as elapsedMs so the server can reject instant (bot) submits. The
// window guard keeps Date.now() out of prerendering (Cache Components
// treats current-time reads during prerender as errors); submitLead itself
// only ever runs in the browser.
const loadedAt = typeof window === "undefined" ? null : Date.now();

/**
 * Sends a lead to /api/contact. Throws on any non-ok response — callers
 * already branch to their error state. `source` labels which form sent it.
 */
export async function submitLead(
  data: Record<string, unknown>,
  source = "website-form",
): Promise<void> {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      source,
      elapsedMs: loadedAt === null ? 0 : Date.now() - loadedAt,
    }),
  });
  if (!response.ok) {
    throw new Error(`Lead submission failed with status ${response.status}`);
  }
}
