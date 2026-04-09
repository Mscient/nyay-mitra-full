import { NextResponse } from "next/server";

// ── RSS feed sources ─────────────────────────────────────────────────────────
const FEEDS: Array<{ url: string; source: string; defaultCategory: string }> = [
  { url: "https://www.livelaw.in/feed/",    source: "LiveLaw",     defaultCategory: "Supreme Court" },
  { url: "https://www.barandbench.com/feed", source: "Bar & Bench", defaultCategory: "High Court" },
];

// Keyword → category mapping for tagging articles
const CATEGORY_RULES: Array<{ keywords: string[]; category: string }> = [
  { keywords: ["supreme court", "sc ", "apex court"],   category: "Supreme Court" },
  { keywords: ["high court", "hc ", "division bench"],  category: "High Court" },
  { keywords: ["ipc", "crpc", "criminal", "fir", "bail", "section 498", "section 302"], category: "Criminal Law" },
  { keywords: ["rti", "right to information", "cic"],   category: "RTI" },
  { keywords: ["gst", "income tax", "cbdt", "cbic"],    category: "Tax Law" },
  { keywords: ["sebi", "rbi", "irdai", "nclat", "nclt", "ibc", "sarfaesi"], category: "Finance & Insolvency" },
  { keywords: ["constitution", "fundamental rights", "article 21", "article 14"], category: "Constitutional" },
  { keywords: ["environment", "ngt", "pollution", "forest"], category: "Environment" },
  { keywords: ["arbitration", "adr", "mediation"],      category: "ADR" },
  { keywords: ["family", "matrimonial", "divorce", "maintenance", "dowry"], category: "Family Law" },
  { keywords: ["property", "land", "realty", "rera"],   category: "Property" },
  { keywords: ["labour", "employment", "workmen", "esic"], category: "Labour Law" },
  { keywords: ["cyber", "IT act", "data protection", "dpdp"], category: "Cyber Law" },
  { keywords: ["gazette", "notification", "ordinance", "bill", "parliament"], category: "Legislation" },
];

function detectCategory(text: string, fallback: string): string {
  const lower = text.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some(k => lower.includes(k))) return rule.category;
  }
  return fallback;
}

function extractTag(item: string, tag: string): string {
  const start = item.indexOf(`<${tag}>`);
  const end   = item.indexOf(`</${tag}>`);
  if (start === -1 || end === -1) return "";
  return item
    .substring(start + tag.length + 2, end)
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .trim();
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>?/gm, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ");
}

// ── GET handler ───────────────────────────────────────────────────────────────
export async function GET() {
  const articles: Array<{
    title: string; link: string; pubDate: string;
    description: string; source: string; category: string;
  }> = [];

  await Promise.allSettled(
    FEEDS.map(async ({ url, source, defaultCategory }) => {
      try {
        const res = await fetch(url, {
          headers: { "User-Agent": "NyayMitra/1.0 (+https://nyaymitra.in) Legal News Aggregator" },
          next: { revalidate: 3600 },
        });
        if (!res.ok) {
          console.warn(`[News] Feed unavailable: ${url} — HTTP ${res.status}`);
          return;
        }
        const xml = await res.text();
        const items = xml.split("<item>");

        for (let i = 1; i < Math.min(items.length, 12); i++) {
          const item = items[i];
          const title    = stripHtml(extractTag(item, "title"));
          const link     = extractTag(item, "link");
          const pubDate  = extractTag(item, "pubDate");
          const rawDesc  = stripHtml(extractTag(item, "description")).substring(0, 220).trim();
          if (!title || !link) continue;

          const category = detectCategory(title + " " + rawDesc, defaultCategory);
          articles.push({ title, link, pubDate, description: rawDesc, source, category });
        }
      } catch (err: any) {
        console.error(`[News] Error fetching ${url}:`, err.message);
      }
    })
  );

  // Sort by most recent, deduplicate by title
  const seen = new Set<string>();
  const unique = articles
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .filter(a => {
      const key = a.title.toLowerCase().slice(0, 60);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 24);

  return NextResponse.json(
    { articles: unique, count: unique.length, sources: FEEDS.map(f => f.source) },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
      },
    }
  );
}
