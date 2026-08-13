// Insert a row under a human-readable slug id, retrying until the id is free.
//
// Student and session ids are slugs ("maria", "s-maria-3") and are GLOBAL primary
// keys — they are not scoped by tutor_id. The generators used to look for a free
// id among the current tutor's rows only, which is fine with one tenant and
// broken with two: the second tutor to add a "Maria" proposed the id "maria",
// which another tutor already owned, and the insert died on a duplicate-key
// error they could do nothing about.
//
// Rather than pre-scanning the table (a race between the check and the insert,
// and a full scan on every insert), we let the database's own uniqueness
// constraint arbitrate: attempt the insert, and on a duplicate-key error move to
// the next candidate. Whoever commits first keeps the shorter id.
//
// Note that ids stay globally unique but are no longer globally *predictable*
// per tutor — a second tutor's "Maria" is "maria-2". That only affects the URL,
// and it leaks nothing: the row itself is still tenant-scoped by every query.

/** Postgres `unique_violation`. */
const UNIQUE_VIOLATION = "23505";

/**
 * Sequential suffixes to try before giving up on readability. Twenty tutors
 * sharing one student name is already unlikely; past that a random suffix keeps
 * the insert from failing outright.
 */
const MAX_SEQUENTIAL = 20;

/**
 * Detect a duplicate-key error anywhere in the error's cause chain.
 *
 * Walking the chain is the whole point: Drizzle wraps driver errors in a
 * `DrizzleQueryError` whose own `code` is undefined and whose message is just
 * "Failed query: insert into …". The Postgres `23505` and its "duplicate key
 * value" text only exist on the nested cause, so checking the top-level error
 * alone silently misses every collision.
 */
function isDuplicateKey(err: unknown, depth = 0): boolean {
  if (typeof err !== "object" || err === null || depth > 5) return false;

  const { code, message, detail, cause } = err as {
    code?: unknown;
    message?: unknown;
    detail?: unknown;
    cause?: unknown;
  };

  if (code === UNIQUE_VIOLATION) return true;

  // Text fallback, in case a future driver reports it without a code. Kept narrow
  // on purpose — Postgres phrases the detail as `Key (id)=(maria) already exists.`,
  // and a looser "already exists" match would swallow unrelated failures.
  if (typeof message === "string" && /duplicate key value/i.test(message)) return true;
  if (typeof detail === "string" && /Key \(.+\) already exists/i.test(detail)) return true;

  return isDuplicateKey(cause, depth + 1);
}

function candidate(base: string, attempt: number): string {
  if (attempt === 0) return base;
  if (attempt <= MAX_SEQUENTIAL) return `${base}-${attempt + 1}`;
  return `${base}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Call `insert` with successive candidate ids until one commits, and return the
 * id that won. `insert` must perform a single insert whose only unique
 * constraint is the id — any other duplicate-key error would be retried here as
 * if it were an id collision.
 */
export async function insertWithUniqueId(
  base: string,
  insert: (id: string) => Promise<unknown>,
): Promise<string> {
  const attempts = MAX_SEQUENTIAL + 5;
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt++) {
    const id = candidate(base, attempt);
    try {
      await insert(id);
      return id;
    } catch (err) {
      if (!isDuplicateKey(err)) throw err;
      lastError = err;
    }
  }

  throw new Error(
    `Couldn't find a free id for "${base}" after ${attempts} attempts: ${
      lastError instanceof Error ? lastError.message : "unknown error"
    }`,
  );
}
