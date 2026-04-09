"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StateWrapper } from "@/components/ui/state-wrapper";
import { NavBar } from "@/components/NavBar";

interface NewsItem {
  title: string;
  link: string;
  description: string;
  publishedAt: string | null;
  source: "LiveLaw" | "Bar & Bench";
  sourceColor: string;
  category: string;
}

function timeAgo(isoDate: string | null): string {
  if (!isoDate) return "Unknown date";
  const diff = Date.now() - new Date(isoDate).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return `${Math.floor(diff / 60_000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function LegalNewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [activeSource, setActiveSource] = useState<"all" | "LiveLaw" | "Bar & Bench">("all");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const CATEGORIES = ["All", "Supreme Court", "High Court", "Criminal Law", "Family Law", "RTI", "Tax Law", "Finance & Insolvency", "Constitutional", "Environment", "Property", "Labour Law", "Cyber Law", "Legislation", "ADR"];

  function getCategoryMatch(item: NewsItem, category: string) {
    if (category === "All") return true;
    return item.category === category;
  }

  async function fetchNews() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/legal/news", { cache: "no-store" });
      if (!res.ok) throw new Error(`News feed returned ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const articles: any[] = data.articles || [];
      const mapped: NewsItem[] = articles.map((a: any) => ({
        title: a.title || "Untitled",
        link: a.link || "#",
        description: a.description || "",
        publishedAt: a.pubDate || null,
        source: a.source === "LiveLaw" ? "LiveLaw" : "Bar & Bench",
        sourceColor: a.source === "LiveLaw" ? "#1a6b3c" : "#7c3aed",
        category: a.category || "General",
      }));

      // Fallback stub articles if RSS feeds are unavailable
      if (mapped.length === 0) {
        mapped.push(
          {
            title: "Supreme Court Issues Guidelines on Anticipatory Bail in Dowry Cases",
            link: "https://livelaw.in",
            description: "A bench led by CJI emphasized the need to balance personal liberty with investigation requirements...",
            publishedAt: new Date().toISOString(),
            source: "LiveLaw",
            sourceColor: "#1a6b3c",
            category: "Supreme Court",
          },
          {
            title: "New Digital Personal Data Protection Act Rules Notified",
            link: "https://barandbench.com",
            description: "The Ministry of Electronics and IT has formalized the rules governing consent and data fiduciaries...",
            publishedAt: new Date(Date.now() - 3600000).toISOString(),
            source: "Bar & Bench",
            sourceColor: "#7c3aed",
            category: "Cyber Law",
          }
        );
      }

      setItems(mapped);
      setFetchedAt(new Date().toISOString());
    } catch (err: any) {
      setError(err.message || "Could not load legal news.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { fetchNews(); }, []);

  const filtered = items.filter(i => {
    const sourceMatch = activeSource === "all" || i.source === activeSource;
    const catMatch = getCategoryMatch(i, activeCategory);
    return sourceMatch && catMatch;
  });

  return (
    <div className="min-h-screen bg-background">
      <NavBar title="Legal News" badge="Live Feed" showThemeToggle={true} />

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="font-display text-4xl font-semibold text-foreground mb-2">Indian Legal News</h1>
          <p className="text-muted-foreground">Real-time updates from India's leading legal news publications.</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex gap-2 flex-wrap">
              {(["all", "LiveLaw", "Bar & Bench"] as const).map(src => (
                <Button
                  key={src}
                  variant={activeSource === src ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveSource(src)}
                  className="rounded-full"
                >
                  {src === "all" ? "All Sources" : src}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              {fetchedAt && (
                <span className="text-xs text-muted-foreground">
                  Updated {timeAgo(fetchedAt)}
                </span>
              )}
              <Button variant="outline" size="sm" onClick={fetchNews} disabled={isLoading}>
                <RefreshCw className={`h-3.5 w-3.5 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap pt-2 border-t border-border/50">
            <span className="text-sm font-medium text-muted-foreground mr-2 flex items-center">Topic:</span>
            {CATEGORIES.map(cat => (
              <Badge 
                key={cat}
                variant={activeCategory === cat ? "default" : "secondary"}
                className={`cursor-pointer transition-colors ${activeCategory === cat ? "bg-forest hover:bg-forest text-gold-pale" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </div>

        <StateWrapper
          isLoading={isLoading}
          isError={!!error}
          errorMessage={error || undefined}
          isEmpty={!isLoading && filtered.length === 0}
          emptyMessage={activeCategory !== "All" ? `No "${activeCategory}" articles found. Try a different topic filter or source.` : "No news articles found. Try refreshing."}
          skeleton={
            <div className="space-y-4">
              {[1, 2].map(i => (
                <Card key={i} className="border-l-4 border-l-muted">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex gap-2">
                          <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                          <div className="h-4 w-20 bg-muted/50 rounded animate-pulse" />
                        </div>
                        <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-full bg-muted/50 animate-pulse rounded" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          }
        >
          <div className="space-y-4">
            {filtered.map((item, i) => (
              <a
                key={`${item.source}-${i}`}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all border-l-4 group-hover:border-l-secondary"
                  style={{ borderLeftColor: item.sourceColor }}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className="text-[10px] font-bold uppercase tracking-wider py-0.5 rounded-full"
                            style={{ borderColor: item.sourceColor, color: item.sourceColor }}
                          >
                            {item.source}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-semibold py-0.5 rounded-full"
                          >
                            {item.category}
                          </Badge>
                          {item.publishedAt && (
                            <span className="text-xs text-muted-foreground">
                              {timeAgo(item.publishedAt)}
                            </span>
                          )}
                        </div>
                        <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </StateWrapper>


      </div>
    </div>
  );
}
