import { NextResponse } from "next/server";
import { readPrefs, pushSummaries } from "@/lib/storage";
import { fetchAll } from "@/lib/fetch";
import { summarizeItems } from "@/lib/summarize";
import { sendEmailDigest, sendTelegramDigest } from "@/lib/delivery";

export const dynamic = "force-dynamic";

export async function POST() {
  const prefs = readPrefs();
  const items = await fetchAll(
    prefs.sources.length > 0
      ? prefs.sources
      : [
          "https://www.reddit.com/r/MachineLearning/.rss",
          "https://www.reddit.com/r/artificial/.rss",
          "https://hnrss.org/frontpage",
          "https://ai.googleblog.com/feeds/posts/default?alt=rss",
          "https://openai.com/blog/rss.xml",
        ]
  );
  const groups = summarizeItems(items);
  pushSummaries(groups);

  const deliveries: any[] = [];
  if (prefs.email) {
    deliveries.push(sendEmailDigest(prefs.email, groups));
  }
  if (prefs.telegramBotToken && prefs.telegramChatId) {
    deliveries.push(sendTelegramDigest(prefs.telegramBotToken, prefs.telegramChatId, groups));
  }
  const results = await Promise.allSettled(deliveries);

  return NextResponse.json({ ok: true, items: items.length, groups: groups.length, deliveries: results });
}

export async function GET() {
  // allow GET to trigger as well (for Vercel Cron)
  return POST();
}
