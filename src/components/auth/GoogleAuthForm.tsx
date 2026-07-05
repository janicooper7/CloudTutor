import { signInWithGoogle } from "@/app/actions/auth";
import GoogleButton from "./GoogleButton";

// Server component: a form whose action kicks off the Google OAuth flow.
export default function GoogleAuthForm({ label }: { label: string }) {
  return (
    <form action={signInWithGoogle}>
      <GoogleButton label={label} submit />
    </form>
  );
}
