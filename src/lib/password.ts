// Password hashing for the email/password sign-up flow.
//
// scrypt from node:crypto rather than a bcrypt package: it's memory-hard, it's
// in the standard library (no native build to break on Netlify), and the cost
// parameters are recorded in the stored string so they can be raised later
// without invalidating existing hashes.
//
// Node-only — never import this from anything the proxy (edge) pulls in.

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>;

// N=2^15 puts a single hash at roughly 100ms and ~32MB of memory. maxmem has to
// be set explicitly: Node's 32MB default is exactly at the limit and throws.
const PARAMS = { N: 32768, r: 8, p: 1, maxmem: 96 * 1024 * 1024 };
const KEYLEN = 64;

/** Stored form: `scrypt$<N>$<r>$<p>$<salt-b64>$<key-b64>`. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scryptAsync(password.normalize("NFKC"), salt, KEYLEN, PARAMS);
  const { N, r, p } = PARAMS;
  return `scrypt$${N}$${r}$${p}$${salt.toString("base64")}$${key.toString("base64")}`;
}

/**
 * Constant-time check of `password` against a stored hash. Returns false rather
 * than throwing on a malformed hash so a bad row can't 500 the login route.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, n, r, p, saltB64, keyB64] = stored.split("$");
  if (scheme !== "scrypt") return false;

  const [N, rr, pp] = [Number(n), Number(r), Number(p)];
  if (!N || !rr || !pp || !saltB64 || !keyB64) return false;

  const expected = Buffer.from(keyB64, "base64");
  try {
    const actual = await scryptAsync(
      password.normalize("NFKC"),
      Buffer.from(saltB64, "base64"),
      expected.length,
      { N, r: rr, p: pp, maxmem: PARAMS.maxmem },
    );
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
