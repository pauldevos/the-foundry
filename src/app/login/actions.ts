"use server";

import { createSession } from "@/lib/session";
import { redirect } from "next/navigation";

export type LoginState = { error?: string } | undefined;

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const passcode = formData.get("passcode");
  const expected = process.env.APP_PASSCODE;

  if (!expected) {
    return { error: "Server misconfigured: APP_PASSCODE not set." };
  }
  if (typeof passcode !== "string" || passcode !== expected) {
    return { error: "Wrong passcode." };
  }

  await createSession();
  const next = formData.get("next");
  redirect(typeof next === "string" && next.startsWith("/") ? next : "/");
}
