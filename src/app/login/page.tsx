import type { Metadata } from "next";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import GoogleAuthForm from "@/components/auth/GoogleAuthForm";

export const metadata: Metadata = {
  title: "Log in · CloudTutor",
  description: "Welcome back to CloudTutor.",
};

export default function LoginPage() {
  return (
    <AuthLayout heading="Welcome back" sub="Log in to pick up where you left off.">
      <GoogleAuthForm label="Continue with Google" />

      <p className="mt-6 text-center text-sm text-muted">
        CloudTutor uses your Google account to sign in — no separate password to remember.
      </p>

      <p className="mt-6 text-center text-ink-soft">
        New to CloudTutor?{" "}
        <Link href="/signup" className="font-semibold text-brand-deep hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
