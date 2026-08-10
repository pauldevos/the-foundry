"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { login } from "./actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  return (
    <form
      action={action}
      className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 p-8 shadow-xl"
    >
      <h1 className="mb-1 font-serif text-2xl text-slate-200">
        Foundry Study
      </h1>
      <p className="mb-6 text-sm text-slate-400">
        Private — enter your passcode.
      </p>
      <input type="hidden" name="next" value={next} />
      <input
        type="password"
        name="passcode"
        autoFocus
        required
        placeholder="Passcode"
        className="mb-3 w-full rounded-lg border border-stone-700 bg-[#0B0F14] px-4 py-2.5 text-slate-200 outline-none focus:border-amber-500"
      />
      {state?.error && (
        <p className="mb-3 text-sm text-red-400">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-amber-500 px-4 py-2.5 font-medium text-stone-950 transition hover:bg-amber-500 disabled:opacity-50"
      >
        {pending ? "Checking..." : "Enter"}
      </button>
    </form>
  );
}
