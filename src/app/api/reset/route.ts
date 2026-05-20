import { NextResponse } from "next/server";
import { resetData } from "@/lib/store";

export async function POST() {
  const data = await resetData();
  return NextResponse.json({ ok: true, data });
}
