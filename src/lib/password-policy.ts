// What counts as an acceptable password. Kept apart from src/lib/password.ts
// (which pulls in node:crypto) so the signup form can import it on the client
// and show the same rule the server enforces.

export const MIN_PASSWORD_LENGTH = 10;
export const PASSWORD_HINT = `At least ${MIN_PASSWORD_LENGTH} characters, with a number.`;

/** Null when the password is acceptable, otherwise the reason to show the user. */
export function passwordProblem(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (password.length > 200) return "That password is too long.";
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return "Include at least one letter and one number.";
  }
  return null;
}
