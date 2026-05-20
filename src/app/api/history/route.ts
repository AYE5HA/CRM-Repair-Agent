import { NextResponse } from "next/server";
import { getData } from "@/lib/store";

export async function GET() {
  const data = await getData();
  return NextResponse.json({ audit: data.audit, syncHistory: data.syncHistory });
}
