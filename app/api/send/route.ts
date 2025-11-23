import { NextRequest, NextResponse } from "next/server";
import { readPrefs, getSummaries } from "@/lib/storage";
import { sendEmailDigest, sendTelegramDigest } from "@/lib/delivery";

export async function POST(_req: NextRequest) {
  const prefs = readPrefs();
  const groups = getSummaries();
  const deliveries: any[] = [];
  if (prefs.email) deliveries.push(sendEmailDigest(prefs.email, groups));
  if (prefs.telegramBotToken && prefs.telegramChatId)
    deliveries.push(sendTelegramDigest(prefs.telegramBotToken, prefs.telegramChatId, groups));

  const results = await Promise.allSettled(deliveries);
  return NextResponse.json({ ok: true, deliveries: results });
}
