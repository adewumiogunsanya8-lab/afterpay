import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

/**
 * Password hashing for dashboard operators.
 *
 * Uses Node's built-in `scrypt` (memory-hard KDF) rather than adding a native
 * dependency, so the hash is portable across every environment the app runs in
 * (Node server, CLI scripts, CI) with no compilation step.
 *
 * The stored format is self-describing:
 *
 *   scrypt$<N>$<r>$<p>$<salt-b64>$<hash-b64>
 *
 * so the cost parameters can be raised later without invalidating existing
 * hashes - old hashes still verify because they carry their own parameters.
 */

/** Cost parameters. N=16384 is the `scrypt` default and takes ~100ms. */
const N = 16384;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number },
) => Promise<Buffer>;

/**
 * Hashes a plain-text password.
 *
 * @returns the encoded hash, safe to store in the database.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const derived = await scrypt(password, salt, KEY_LENGTH, { N, r: R, p: P });
  return [
    "scrypt",
    N,
    R,
    P,
    salt.toString("base64"),
    derived.toString("base64"),
  ].join("$");
}

/**
 * Verifies a plain-text password against a stored hash.
 *
 * Returns `false` for malformed hashes rather than throwing, so a corrupted
 * row can never crash a login attempt.
 */
export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const n = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  if (!Number.isInteger(n) || !Number.isInteger(r) || !Number.isInteger(p)) {
    return false;
  }

  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(parts[4], "base64");
    expected = Buffer.from(parts[5], "base64");
  } catch {
    return false;
  }
  if (salt.length === 0 || expected.length === 0) return false;

  let derived: Buffer;
  try {
    derived = await scrypt(password, salt, expected.length, { N: n, r, p });
  } catch {
    return false;
  }

  return (
    derived.length === expected.length && timingSafeEqual(derived, expected)
  );
}
