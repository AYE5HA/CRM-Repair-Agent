import { NextResponse } from "next/server";
import { editProposal } from "@/lib/store";

export async function PATCH(request: Request) {
  const body = await request.json();
  if (!body.recordId || !body.proposalId || body.value === undefined) {
    return NextResponse.json({ error: "recordId, proposalId, and value are required." }, { status: 400 });
  }
  const record = await editProposal(body.recordId, body.proposalId, String(body.value));
  return NextResponse.json({ record });
}
