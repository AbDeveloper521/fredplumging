import "server-only";
import { randomInt } from "node:crypto";

/**
 * The request reference — the short code that appears in BOTH emails and in
 * the business email's subject line, so the customer and Fred are quoting the
 * same string at each other on the phone.
 *
 * Shape: `FP-XXXXX`, e.g. `FP-7K2QM`.
 *
 * Why random and not a counter:
 *   • An incrementing number is a public disclosure of how many leads the
 *     business gets — FP-1048 today and FP-1051 next week tells a competitor
 *     (or the customer) the weekly volume. A random suffix says nothing.
 *   • A counter also needs shared state. This site has no database and runs on
 *     serverless instances that do not share memory; a per-instance counter
 *     would hand out the same "next" number from two instances at once.
 *
 * Why THIS alphabet: Crockford base32 — the digits plus the letters, minus
 * I, L, O and U. I/1, L/1 and O/0 are the pairs people mishear and mistype
 * when a code is read down a phone line, and dropping U keeps the generator
 * from spelling anything unfortunate. Five characters over 32 symbols is
 * 33.5 million codes: collisions are a non-issue at this volume, and it is
 * still short enough to say in one breath.
 *
 * Not a secret and not a key: it identifies a conversation, it does not
 * authenticate anything. Nothing in the app looks a lead up by it.
 */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const LENGTH = 5;
const PREFIX = "FP";

export function createLeadReference(): string {
  let code = "";
  // randomInt is the crypto-grade, bias-free pick — Math.random would be
  // predictable, which for a code printed in two people's inboxes is
  // needless sloppiness even though nothing is gated on it.
  for (let i = 0; i < LENGTH; i += 1) {
    code += ALPHABET[randomInt(ALPHABET.length)];
  }
  return `${PREFIX}-${code}`;
}
