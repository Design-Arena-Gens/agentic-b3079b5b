"use client";

import { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";

type Prefs = {
  sources: string[];
  email?: string;
  telegramBotToken?: string;
  telegramChatId?: string;
  schedule?: string;
};

type SummaryGroup = {
  topic: string;
  createdAt: string;
  items: Array<{
    id: string;
    title: string;
    url: string;
    summary: string;
    sentiment: number;
    entities: string[];
    publishedAt?: string;
  }>;
};

export default function Page() {
  const [prefs, setPrefs] = useState<Prefs>({ sources: [] });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [summaries, setSummaries] = useState<SummaryGroup[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/prefs", { cache: "no-store" });
        const data = await res.json();
        setPrefs(data);
      } catch (e) {
        // ignore
      }
      await refreshSummaries();
    })();
  }, []);

  const defaultSources = useMemo(
    () =>
      [
        "https://www.reddit.com/r/MachineLearning/.rss",
        "https://www.reddit.com/r/artificial/.rss",
        "https://hnrss.org/frontpage",
        "https://ai.googleblog.com/feeds/posts/default?alt=rss",
        "https://openai.com/blog/rss.xml"
      ],
    []
  );

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/prefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      if (!res.ok) throw new Error(await res.text());
    } catch (e: any) {
      setError(e?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function runNow() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cron", { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      await refreshSummaries();
    } catch (e: any) {
      setError(e?.message ?? "Run failed");
    } finally {
      setLoading(false);
    }
  }

  async function refreshSummaries() {
    try {
      const res = await fetch("/api/summarize", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setSummaries(data ?? []);
      }
    } catch {}
  }

  return (
    <div className="space-y-6">
      <section className="card">
        <div className="card-header">Settings</div>
        <div className="card-body space-y-4">
          {error && (
            <div className="rounded border border-red-300 bg-red-50 p-3 text-red-800 text-sm">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium">Sources (one per line)</label>
            <textarea
              className="mt-1 w-full rounded border p-2 font-mono text-sm min-h-[120px]"
              placeholder={defaultSources.join("\n")}
              value={prefs.sources?.join("\n") ?? ""}
              onChange={(e) => setPrefs((p) => ({ ...p, sources: e.target.value.split(/\n+/).map(s => s.trim()).filter(Boolean) }))}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Email (optional)</label>
              <input
                className="mt-1 w-full rounded border p-2"
                placeholder="you@example.com"
                value={prefs.email ?? ""}
                onChange={(e) => setPrefs((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Schedule CRON (Vercel Cron)</label>
              <input
                className="mt-1 w-full rounded border p-2"
                placeholder="0 * * * * (hourly)"
                value={prefs.schedule ?? ""}
                onChange={(e) => setPrefs((p) => ({ ...p, schedule: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Telegram Bot Token (optional)</label>
              <input
                className="mt-1 w-full rounded border p-2"
                placeholder="12345:ABCDEF..."
                value={prefs.telegramBotToken ?? ""}
                onChange={(e) => setPrefs((p) => ({ ...p, telegramBotToken: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Telegram Chat ID (optional)</label>
              <input
                className="mt-1 w-full rounded border p-2"
                placeholder="123456789"
                value={prefs.telegramChatId ?? ""}
                onChange={(e) => setPrefs((p) => ({ ...p, telegramChatId: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={save} disabled={saving} className="rounded bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 disabled:opacity-50">{saving ? "Saving..." : "Save Settings"}</button>
            <button onClick={runNow} disabled={loading} className="rounded bg-green-600 text-white px-4 py-2 hover:bg-green-700 disabled:opacity-50">{loading ? "Running..." : "Run Now"}</button>
          </div>
          <p className="text-xs text-gray-500">Delivery requires environment SMTP settings or Telegram token/chat. If not set, summaries will be available below.</p>
        </div>
      </section>

      <section className="card">
        <div className="card-header flex items-center justify-between">
          <span>Latest Summaries</span>
          <button onClick={refreshSummaries} className="text-sm text-blue-600 hover:underline">Refresh</button>
        </div>
        <div className="card-body space-y-6">
          {summaries.length === 0 && (
            <div className="text-sm text-gray-600">No summaries yet. Click "Run Now".</div>
          )}
          {summaries.map((group) => (
            <div key={group.topic} className="space-y-2">
              <div className="text-lg font-semibold">{group.topic} <span className="text-xs text-gray-500">{new Date(group.createdAt).toLocaleString()}</span></div>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li key={item.id} className="border rounded p-3 hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-4">
                      <a href={item.url} target="_blank" className="font-medium text-blue-700 hover:underline">{item.title}</a>
                      <span className={`text-xs px-2 py-0.5 rounded ${item.sentiment > 0.2 ? "bg-green-100 text-green-800" : item.sentiment < -0.2 ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}`}>{item.sentiment.toFixed(2)}</span>
                    </div>
                    <div className="text-sm text-gray-700 mt-1">{item.summary}</div>
                    {item.entities?.length > 0 && (
                      <div className="mt-1 text-xs text-gray-500">Entities: {item.entities.slice(0,6).join(", ")}</div>
                    )}
                    {item.publishedAt && (
                      <div className="mt-1 text-xs text-gray-400">Published: {new Date(item.publishedAt).toLocaleString()}</div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
