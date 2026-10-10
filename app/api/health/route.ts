import { NextResponse } from "next/server";

export async function GET() {
  let gymApi = false;
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/health`, { cache: "no-store" });
    gymApi = response.ok;
  } catch {
    gymApi = false;
  }
  return NextResponse.json({ ok: gymApi, api: gymApi });
}
