import { deleteSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await deleteSession();
  return NextResponse.redirect(new URL("/login", req.url));
}
