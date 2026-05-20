import { NextResponse } from "next/server";
import { analyzeInput } from "@/lib/analyzer";
import { addRecord } from "@/lib/store";
import type { Evidence } from "@/lib/types";

export async function POST(request: Request) {
  const formData = await request.formData();
  const pasted = String(formData.get("text") || "");
  const inputType = String(formData.get("inputType") || "note") as Evidence["sourceType"];
  const file = formData.get("file");
  let fileText = "";

  if (file instanceof File && file.size > 0) {
    const name = file.name.toLowerCase();
    if (name.endsWith(".txt") || name.endsWith(".md") || name.endsWith(".csv")) {
      fileText = await file.text();
    } else {
      fileText = `[Uploaded ${file.name}. PDF/binary parsing is represented as metadata in demo mode. Add a parser adapter for production OCR.]`;
    }
  }

  const text = [pasted, fileText].filter(Boolean).join("\n\n");
  if (!text.trim()) {
    return NextResponse.json({ error: "Paste text or upload a supported file." }, { status: 400 });
  }

  const record = analyzeInput(text, inputType);
  await addRecord(record);
  return NextResponse.json({ record });
}
