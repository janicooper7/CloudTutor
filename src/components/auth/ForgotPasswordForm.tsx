"use client";

import { useActionState } from "react";
import { requestPasswordReset, type AuthFormState } from "@/app/actions/auth";
import AuthField from "./AuthField";

const initial: AuthFormState = {};

export default function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, initial);

  // Deliberately the same receipt whether or not the address has an account —
  // see requestPasswordReset. Everything specific is said in the email itself.
  if (state.sent) {
    return (
      <div className="rounded-2xl border border-brand-line bg-white p-6 text-center shadow-soft-sm">
        <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-brand/20 text-lg">
          ✉️
        </div>
        <p className="mt-4 font-semibold text-ink">Check your inbox</p>
        <p className="mt-2 text-ink-soft">
          If there&apos;s a BumbleNote account for{" "}
          <span className="font-medium text-ink">{state.values?.email}</span>, we&apos;ve
          sent it a link to reset the password. It expires in an hour.
        </p>
        <p className="mt-4 text-sm text-muted">
          Nothing after a few minutes? Check spam, then try again.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      <AuthField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        autoFocus
        defaultValue={state.values?.email}
        error={state.errors?.email}
      />

      {state.formError ? (
        <p role="alert" className="text-sm text-[#d9534f]">
          {state.formError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-brand px-6 py-3.5 font-semibold text-ink shadow-soft-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft-md disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {pending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
