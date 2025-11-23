import { NextRequest, NextResponse } from "next/server";
import { readPrefs, writePrefs } from "@/lib/storage";

export async function GET() {
  return NextResponse.json(readPrefs());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body || typeof body !== "object") return new NextResponse("Bad Request", { status: 400 });
  const prefs = writePrefs({
    sources: Array.isArray(body.sources) ? body.sources : [],
    email: body.email || undefined,
    telegramBotToken: body.telegramBotToken || undefined,
    telegramChatId: body.telegramChatId || undefined,
    schedule: body.schedule || undefined,
  });
  return NextResponse.json(prefs);
}
