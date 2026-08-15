"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetPassword, type AuthFormState } from "@/app/actions/auth";
import { MIN_PASSWORD_LENGTH, PASSWORD_HINT } from "@/lib/password-policy";
import AuthField from "./AuthField";

const initial: AuthFormState = {};

export default function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, initial);

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="token" value={token} />

      <AuthField
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        autoFocus
        minLength={MIN_PASSWORD_LENGTH}
        hint={PASSWORD_HINT}
        error={state.errors?.password}
      />

      <AuthField
        label="Confirm new password"
        name="confirm"
        type="password"
        autoComplete="new-password"
        error={state.errors?.confirm}
      />

      {state.formError ? (
        <div role="alert" className="text-sm text-[#d9534f]">
          {state.formError}{" "}
          <Link href="/forgot" className="font-semibold underline">
            Request a new link
          </Link>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-brand px-6 py-3.5 font-semibold text-ink shadow-soft-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft-md disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {pending ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}
