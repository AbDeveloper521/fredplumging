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

/**
 * Mock async submission handler.
 * Replace the body of this function with a real request, e.g.:
 *   await fetch("/api/contact", { method: "POST", body: JSON.stringify(data) })
 */
export async function submitLead(data: Record<string, unknown>): Promise<void> {
  void data;
  await new Promise((resolve) => setTimeout(resolve, 1100));
}
