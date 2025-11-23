import { NextRequest, NextResponse } from "next/server";
import { fetchAll } from "@/lib/fetch";
import { readPrefs } from "@/lib/storage";

export async function POST(_req: NextRequest) {
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
  return NextResponse.json({ count: items.length, items });
}
