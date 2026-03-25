import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/ThemeProvider";
import { Moon, Sun, Search, Users, FileText, Calendar, ArrowLeft, CheckCircle2, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StateWrapper } from "@/components/ui/state-wrapper";
import { Badge } from "@/components/ui/badge";

export interface CaseResult {
  id: string;
  title: string;
  citation: string;
  court: string;
  year: number;
  section: string[];
  topic: string;
  summary: string;
  goodLaw: boolean;
  legal_principles?: string;
}

type TabId = "search" | "tracker" | "drafts" | "calendar";

const TABS: { id: TabId; label: string; icon: any }[] = [
  { id: "search", label: "Case Research", icon: Search },
  { id: "tracker", label: "My Clients", icon: Users },
  { id: "drafts", label: "Draft Studio", icon: FileText },
  { id: "calendar", label: "Hearings", icon: Calendar },
];

const MOCK_CLIENTS = [
  { id: "1", name: "Ramesh Kumar", case: "State v. Ramesh Kumar", section: "302 IPC", court: "Sessions Court, Pune", nextHearing: "2026-03-28", status: "bail_pending", daysInCustody: 340 },
  { id: "2", name: "Priya Sharma", case: "Priya Sharma v. M/s ABC Pvt Ltd", section: "Consumer Complaint", court: "DCDRC, Mumbai", nextHearing: "2026-03-31", status: "active", daysInCustody: 0 },
  { id: "3", name: "Mohammed Iqbal", case: "State v. Mohammed Iqbal", section: "420, 467 IPC", court: "CJM, Nashik", nextHearing: "2026-04-05", status: "bail_granted", daysInCustody: 0 },
];

export default function VakilSahayakPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<TabId>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<CaseResult[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  async function handleSearch(q = searchQuery) {
    if (!q.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    setSelectedCase(null);
    setSearchQuery(q);
    setSearchError(null);
    try {
      const res = await fetch(`/api/legal/search/semantic?q=${encodeURIComponent(q)}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        const rows = data.results || data;
        const mapped = rows.map((r: any) => ({
          id: r.id.toString(),
          title: r.case_title,
          citation: r.case_number || "Citation Missing",
          court: r.court_type || "Court",
          year: r.year_decided,
          section: [],
          topic: r.issue_categories,
          summary: r.summary,
          goodLaw: r.precedent_value > 60,
          legal_principles: r.legal_principles
        }));
        setResults(mapped);
      } else {
        const errData = await res.json();
        setSearchError(errData.error || "Failed to search case law.");
      }
    } catch (err) {
      console.error(err);
      setSearchError("Network error occurred while searching.");
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-primary border-b border-primary/20 px-4 md:px-8 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 md:gap-4">
          <Button variant="ghost" size="icon" className="text-secondary md:hidden" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Link href="/" className="hidden md:flex">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-secondary cursor-pointer hover:text-secondary/80 transition-colors">
              ← Nyay Mitra
            </span>
          </Link>
          <div className="hidden md:block w-px h-5 bg-primary-foreground/20" />
          <div className="font-display text-lg md:text-xl font-semibold text-primary-foreground">
            Vakil Sahayak
          </div>
          <Badge variant="secondary" className="hidden sm:inline-flex bg-secondary/15 text-secondary border-none text-[10px] tracking-wider uppercase px-2.5 py-0.5">
            Advocate Portal
          </Badge>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-secondary hover:bg-secondary/10">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
          {user ? (
            <span className="text-sm text-primary-foreground/70 font-medium hidden sm:inline-block">
              Adv. {user.name}
            </span>
          ) : (
            <Button onClick={() => navigate("/login?returnTo=/vakil-sahayak")} variant="secondary" size="sm" className="font-bold text-xs">
              Login
            </Button>
          )}
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Sidebar / Bottom Nav (Mobile) */}
        <div className="w-full md:w-64 bg-muted/30 md:bg-primary/5 p-2 md:p-4 flex md:flex-col gap-1 md:gap-2 flex-shrink-0 overflow-x-auto md:overflow-y-auto border-b md:border-b-0 md:border-r border-border order-first md:order-none z-10">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                variant={isActive ? "secondary" : "ghost"}
                className={`justify-start gap-3 whitespace-nowrap ${isActive ? 'bg-secondary/15 text-secondary hover:bg-secondary/25' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline-block">{tab.label}</span>
              </Button>
            );
          })}
          <div className="hidden md:block flex-1" />
          <Button variant="outline" className="hidden md:flex justify-start gap-3 border-secondary/20 text-secondary hover:bg-secondary/5 mt-4" onClick={() => navigate("/undertrial-tracker")}>
            ⚖️ Undertrial 436A
          </Button>
          <Button variant="outline" className="hidden md:flex justify-start gap-3 border-secondary/20 text-secondary hover:bg-secondary/5 mt-2" onClick={() => navigate("/court-fee-calculator")}>
            🧮 Fee Calculator
          </Button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          
          {/* ── CASE SEARCH ── */}
          {activeTab === "search" && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div>
                <h1 className="t-heading mb-2">Case Law Research</h1>
                <p className="t-body text-muted-foreground">Semantic search over Supreme Court & High Court judgments. Demo uses landmark cases.</p>
              </div>

              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSearch()}
                    placeholder="Search by topic, section, party name (e.g. 'criminal bail')"
                    className="pl-10 h-12 text-base rounded-xl border-border bg-card shadow-sm focus-visible:ring-secondary"
                  />
                </div>
                <Button onClick={() => handleSearch()} size="lg" className="h-12 rounded-xl px-8 w-full sm:w-auto">
                  Search
                </Button>
              </div>

              {/* Quick Filters */}
              <div className="flex gap-2 flex-wrap pb-2">
                {["sexual harassment", "self defense", "divorce custody", "right to privacy", "consumer protection"].map(q => (
                  <Badge 
                    key={q} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-secondary/10 hover:text-secondary hover:border-secondary transition-colors py-1.5 px-3 rounded-full font-normal"
                    onClick={() => handleSearch(q)}
                  >
                    {q}
                  </Badge>
                ))}
              </div>

              {/* Results Area */}
              <div className={`grid gap-6 ${selectedCase ? "lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_450px]" : "grid-cols-1"}`}>
                <div className="space-y-4">
                  <StateWrapper 
                    isLoading={isSearching} 
                    isEmpty={hasSearched && results.length === 0}
                    isError={!!searchError}
                    errorMessage={searchError || undefined}
                    emptyMessage={`No legal precedents found matching "${searchQuery}". Try broader terms.`}
                  >
                    <div className="grid gap-4">
                      {results.map(c => (
                        <Card 
                          key={c.id} 
                          className={`cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 border-l-4 ${selectedCase?.id === c.id ? 'border-l-secondary bg-secondary/5 ring-1 ring-secondary/20' : 'border-l-transparent hover:border-l-secondary/50'}`}
                          onClick={() => setSelectedCase(c)}
                        >
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-1.5">
                                <h3 className="font-display text-lg font-semibold text-foreground leading-tight">{c.title}</h3>
                                <p className="text-xs font-bold text-secondary">{c.citation}</p>
                                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{c.summary}</p>
                              </div>
                              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                {c.goodLaw && (
                                  <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-none px-2 rounded-md">
                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Good Law
                                  </Badge>
                                )}
                                <span className="text-[11px] text-muted-foreground font-medium">{c.court} · {c.year}</span>
                              </div>
                            </div>
                            {c.section.length > 0 && (
                              <div className="flex gap-2 mt-4 flex-wrap">
                                {c.section.map(s => (
                                  <Badge key={s} variant="secondary" className="bg-muted text-muted-foreground rounded-md text-[10px] font-semibold uppercase">
                                    Sec {s}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </StateWrapper>
                </div>

                {/* Case Detail Panel (Desktop Sticky / Mobile Overlay) */}
                {selectedCase && (
                  <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:static lg:bg-transparent lg:z-auto lg:block">
                    <div className="absolute inset-y-0 right-0 w-full md:w-[450px] lg:w-auto h-full bg-card shadow-2xl lg:shadow-none lg:border lg:border-secondary/30 lg:rounded-2xl flex flex-col">
                      <div className="p-4 border-b border-border flex items-center justify-between lg:hidden bg-muted/30">
                        <span className="font-display font-semibold">Case Details</span>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedCase(null)}>
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                      
                      <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
                        <Button variant="ghost" size="sm" className="hidden lg:flex -ml-3 text-muted-foreground" onClick={() => setSelectedCase(null)}>
                          <ArrowLeft className="h-4 w-4 mr-2" /> Back to results
                        </Button>
                        
                        <div>
                          <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground leading-tight mb-2">{selectedCase.title}</h2>
                          <div className="text-sm font-bold text-secondary mb-4">{selectedCase.citation}</div>
                          
                          <div className="flex gap-2 flex-wrap mb-6">
                            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-none">{selectedCase.court}</Badge>
                            <Badge variant="outline">{selectedCase.year}</Badge>
                            {selectedCase.goodLaw && <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-none">Not Overruled</Badge>}
                          </div>
                        </div>

                        <div>
                          <h4 className="t-label mb-3">AI Summary</h4>
                          <p className="t-body bg-muted/30 p-4 rounded-xl border border-border/50">{selectedCase.summary}</p>
                        </div>
                        
                        {selectedCase.legal_principles && (() => {
                          let principles = selectedCase.legal_principles;
                          try { principles = JSON.parse(selectedCase.legal_principles).join("\n• "); } catch {}
                          return (
                            <div>
                              <h4 className="t-label mb-3">Legal Principles Established</h4>
                              <div className="t-body space-y-2">
                                <p>• {principles}</p>
                              </div>
                            </div>
                          );
                        })()}

                        {selectedCase.section.length > 0 && (
                          <div>
                            <h4 className="t-label mb-3">Relevant Sections</h4>
                            <div className="flex gap-2 flex-wrap">
                              {selectedCase.section.map(s => (
                                <Badge key={s} variant="secondary">{s}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-6 mt-6 border-t border-border">
                          <Button className="w-full" variant="default" asChild>
                            <a href={`https://indiankanoon.org/search/?formInput=${encodeURIComponent(selectedCase.title)}`} target="_blank" rel="noopener noreferrer">
                              View full judgment on IndianKanoon <ChevronRight className="h-4 w-4 ml-2" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── CLIENTS TRACKER ── */}
          {activeTab === "tracker" && (
            <div className="max-w-4xl mx-auto">
              <h1 className="t-heading mb-8">My Clients</h1>
              <div className="space-y-4">
                {MOCK_CLIENTS.map(c => (
                  <Card key={c.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                      <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-display text-xl font-bold shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="font-display text-xl font-semibold">{c.name}</div>
                        <div className="text-sm text-muted-foreground">{c.case} · {c.section}</div>
                        <div className="text-xs text-muted-foreground/80">{c.court}</div>
                      </div>
                      <div className="sm:text-right w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-border">
                        <Badge 
                          variant="outline" 
                          className={`mb-2 ${c.status === 'bail_pending' ? 'border-destructive text-destructive' : c.status === 'bail_granted' ? 'border-emerald-500 text-emerald-600' : ''}`}
                        >
                          {c.status === "bail_pending" ? "Bail Pending" : c.status === "bail_granted" ? "Bail Granted" : "Active"}
                        </Badge>
                        <div className="text-sm font-medium">Hearing: {new Date(c.nextHearing).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                        {c.daysInCustody > 0 && <div className="text-xs font-semibold text-destructive mt-1">{c.daysInCustody} days in custody</div>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ── DRAFT STUDIO ── */}
          {activeTab === "drafts" && (
            <div className="max-w-4xl mx-auto text-center py-12 md:py-24">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
                <FileText className="h-10 w-10" />
              </div>
              <h1 className="t-heading mb-4">Draft Studio</h1>
              <p className="t-body max-w-lg mx-auto mb-8">Generate legal documents, notices, and petitions directly from your client matter files.</p>
              <Button size="lg" onClick={() => navigate("/documents")}>
                Open Document Generator
              </Button>
            </div>
          )}

          {/* ── CALENDAR ── */}
          {activeTab === "calendar" && (
            <div className="max-w-4xl mx-auto">
              <h1 className="t-heading mb-8">Upcoming Hearings</h1>
              <div className="space-y-4">
                {MOCK_CLIENTS.sort((a, b) => a.nextHearing.localeCompare(b.nextHearing)).map(c => {
                  const d = new Date(c.nextHearing);
                  const daysUntil = Math.max(0, Math.ceil((d.getTime() - Date.now()) / 86400000));
                  const isUrgent = daysUntil <= 3;
                  
                  return (
                    <Card key={c.id} className={isUrgent ? 'border-destructive/30 shadow-sm' : ''}>
                      <CardContent className="p-4 sm:p-5 flex items-center gap-4 sm:gap-6">
                        <div className={`h-16 w-14 rounded-xl flex flex-col items-center justify-center shrink-0 ${isUrgent ? 'bg-destructive/10 text-destructive' : 'bg-primary/5 text-primary'}`}>
                          <span className="font-display text-2xl font-bold leading-none">{d.getDate()}</span>
                          <span className="text-[10px] font-semibold uppercase mt-1 tracking-wider">{d.toLocaleString("en-IN", { month: "short" })}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display text-lg font-semibold truncate">{c.name} — {c.section}</h3>
                          <p className="text-sm text-muted-foreground truncate">{c.court}</p>
                        </div>
                        <div className={`text-sm font-semibold shrink-0 ${isUrgent ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil} days`}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
