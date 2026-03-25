import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, ExternalLink, RefreshCw, Newspaper, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StateWrapper } from "@/components/ui/state-wrapper";
import { NavBar } from "@/components/NavBar";
import { useTheme } from "@/components/ThemeProvider";
import { Moon, Sun } from "lucide-react";

interface NewsItem {
  title: string;
  link: string;
  description: string;
  publishedAt: string | null;
  source: "LiveLaw" | "Bar & Bench";
  sourceColor: string;
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
  const { theme, toggleTheme } = useTheme();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [activeSource, setActiveSource] = useState<"all" | "LiveLaw" | "Bar & Bench">("all");

  async function fetchNews() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/legal/news");
      if (!res.ok) throw new Error("Failed to load news feed.");
      const data = await res.json();
      setItems(data.items || []);
      setFetchedAt(data.fetchedAt || null);
    } catch (err: any) {
      setError(err.message || "Could not load legal news.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { fetchNews(); }, []);

  const filtered = activeSource === "all" ? items : items.filter(i => i.source === activeSource);

  return (
    <div className="min-h-screen bg-background">
      <NavBar title="Legal News" badge="Live Feed" />

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-4xl font-semibold text-foreground mb-2">Indian Legal News</h1>
          <p className="text-muted-foreground">Real-time updates from India's leading legal news publications.</p>
        </div>

        {/* Controls */}
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

        {/* News Feed */}
        <StateWrapper
          isLoading={isLoading}
          isError={!!error}
          errorMessage={error || undefined}
          isEmpty={!isLoading && filtered.length === 0}
          emptyMessage="No news articles found for the selected source."
          skeleton={
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
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

        {/* Disclaimer */}
        {!isLoading && filtered.length > 0 && (
          <div className="rounded-xl border border-border bg-muted/30 p-4 flex gap-3 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground/70" />
            <p>News is aggregated from LiveLaw and Bar & Bench RSS feeds. Nyay Mitra does not own or endorse this content. For legal advice, always consult a qualified lawyer.</p>
          </div>
        )}
      </div>
    </div>
  );
}
