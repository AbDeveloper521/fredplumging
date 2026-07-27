import "server-only";
import { client } from "@/sanity/client";

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `[sanity] Missing required environment variable ${name}. ` +
        `Copy .env.example to .env.local and fill in the values.`,
    );
  }
  return value;
}

const token = requireEnv(
  process.env.SANITY_API_READ_TOKEN,
  "SANITY_API_READ_TOKEN",
);

/** Read client with the server-side token — never import from client code. */
export const serverClient = client.withConfig({ token });
