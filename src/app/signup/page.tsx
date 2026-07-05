import type { Metadata } from "next";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import GoogleAuthForm from "@/components/auth/GoogleAuthForm";

export const metadata: Metadata = {
  title: "Create your account · CloudTutor",
  description: "Start free — no card required. Better feedback for every student.",
};

export default function SignupPage() {
  return (
    <AuthLayout
      heading="Create your account"
      sub="Start free — no card required. Cancel anytime."
    >
      <GoogleAuthForm label="Sign up with Google" />

      <p className="mt-6 text-center text-sm text-muted">
        We&apos;ll set up your account from your Google profile. By continuing you agree to our{" "}
        <a href="#" className="text-brand-deep hover:underline">Terms</a> and{" "}
        <a href="#" className="text-brand-deep hover:underline">Privacy Policy</a>.
      </p>

      <p className="mt-6 text-center text-ink-soft">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-deep hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
