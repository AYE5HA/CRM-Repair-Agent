import { NextResponse } from "next/server";
import { approveRecord, syncRecord } from "@/lib/store";

export async function POST(request: Request) {
  const body = await request.json();
  if (body.action === "approve") {
    const record = await approveRecord(body.recordId, body.approvedIds || []);
    return NextResponse.json({ record });
  }
  if (body.action === "sync") {
    const record = await syncRecord(body.recordId);
    return NextResponse.json({ record });
  }
  return NextResponse.json({ error: "Unsupported sync action." }, { status: 400 });
}
