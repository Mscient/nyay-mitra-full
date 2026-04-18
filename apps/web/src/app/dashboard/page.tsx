"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getUser, getToken, authHeaders, logout, isAuthenticated } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";

interface DashboardStats {
  active_matters: number;
  upcoming_hearings: number;
  total_clients: number;
  pending_fees: number;
  recent_hearings: Array<{
    id: string;
    scheduledAt: string;
    courtCode?: string;
    purpose?: string;
    matterId: string;
    status: string;
  }>;
}

interface QuickClient {
  id: string;
  fullName: string;
  caseTitle?: string;
  createdAt: string;
}

function StatCard({ value, label, icon, color, prefix = "", delayClass = "" }: {
  value: number | string; label: string; icon: string; color: string; prefix?: string; delayClass?: string;
}) {
  return (
    <div className={`glass-card ${delayClass}`} style={{
      padding: "28px 24px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: 100, height: 100,
        background: color,
        opacity: 0.06,
        borderRadius: "0 0 0 100px",
      }} />
      <div style={{ fontSize: 32, lineHeight: 1 }}>{icon}</div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 700, color: "var(--forest)", lineHeight: 1.1, marginTop: 4 }}>
        {prefix}{typeof value === "number" ? value?.toLocaleString("en-IN") : value}
      </div>
      <div style={{ fontSize: 13, color: "var(--ink-muted)", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

function HearingCard({ hearing }: { hearing: DashboardStats["recent_hearings"][0] }) {
  const date = new Date(hearing.scheduledAt);
  const isToday = new Date().toDateString() === date.toDateString();
  const isTomorrow = new Date(Date.now() + 86400000).toDateString() === date.toDateString();

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "14px 18px",
      background: "var(--cream)",
      borderRadius: 10,
      border: "1px solid var(--border-color)",
    }}>
      <div style={{
        minWidth: 52, textAlign: "center",
        background: isToday ? "var(--gold)" : "var(--forest)",
        color: isToday ? "var(--forest)" : "var(--gold-pale)",
        borderRadius: 10,
        padding: "6px 0",
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Cormorant Garamond', serif" }}>
          {date.getDate()}
        </div>
        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
          {date.toLocaleString("en-IN", { month: "short" })}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {hearing.purpose || "Hearing"}
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>
          {hearing.courtCode || "Court"} · {date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
      <div style={{
        fontSize: 11, fontWeight: 600,
        padding: "3px 10px",
        borderRadius: 20,
        background: isToday ? "#fff3cd" : isTomorrow ? "#d1ecf1" : "#e8f5e9",
        color: isToday ? "#856404" : isTomorrow ? "#0c5460" : "#2e7d32",
      }}>
        {isToday ? "TODAY" : isTomorrow ? "TOMORROW" : "UPCOMING"}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [clients, setClients] = useState<QuickClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    const headers = authHeaders();
    const [statsRes, clientsRes] = await Promise.allSettled([
      fetch("/api/workspace/dashboard", { headers }),
      fetch("/api/workspace/clients?limit=5", { headers }),
    ]);

    if (statsRes.status === "fulfilled" && statsRes.value.ok) {
      const data = await statsRes.value.json();
      setStats(data);
    } else {
      setError("Workspace service is offline. Start workspace-svc to see live data.");
    }

    if (clientsRes.status === "fulfilled" && clientsRes.value.ok) {
      const data = await clientsRes.value.json();
      setClients(data.clients || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const u = getUser();
    if (!u || !isAuthenticated()) {
      router.push("/login");
      return;
    }
    setUser(u);
    fetchData();
  }, [fetchData, router]);

  if (loading) return (
    <main style={{ minHeight: "100vh", background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚖️</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: "var(--forest)" }}>Loading Dashboard…</div>
      </div>
    </main>
  );

  return (
    <div className="dashboard-bg">
      <main style={{ padding: "32px 24px", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div className="stagger-1" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 700, color: "var(--forest)", lineHeight: 1.1 }}>
              Welcome back, {user?.name?.split(" ")[0] ?? "Advocate"} 👋
            </div>
            <div style={{ fontSize: 14, color: "var(--ink-muted)", marginTop: 4 }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <a href="/vakil-sahayak" style={{
              padding: "10px 20px",
              background: "var(--forest)",
              color: "var(--gold-pale)",
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 13,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>⚖️ Open CRM</a>
            <a href="/documents" style={{
              padding: "10px 20px",
              background: "var(--ivory)",
              color: "var(--forest)",
              border: "1.5px solid var(--border-color)",
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 13,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>📄 Draft Document</a>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div style={{
            background: "#fff3cd",
            border: "1px solid #ffc107",
            borderRadius: 10,
            padding: "12px 18px",
            marginBottom: 24,
            fontSize: 13,
            color: "#856404",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Stats Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}>
          <StatCard value={stats?.active_matters ?? 0} label="Active Matters" icon="📁" color="#1A2E1A" delayClass="stagger-1" />
          <StatCard value={stats?.upcoming_hearings ?? 0} label="Upcoming Hearings" icon="📅" color="#C9920A" delayClass="stagger-2" />
          <StatCard value={stats?.total_clients ?? 0} label="Total Clients" icon="👥" color="#1A2E1A" delayClass="stagger-3" />
          <StatCard
            value={stats?.pending_fees != null ? `₹${Number(stats.pending_fees).toLocaleString("en-IN")}` : "₹0"}
            label="Pending Fees"
            icon="💰"
            color="#C9920A"
            delayClass="stagger-4"
          />
        </div>

        {/* Two-column layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="stagger-5">

          {/* Upcoming Hearings */}
          <div className="glass-panel" style={{ borderRadius: 16, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: "var(--forest)", margin: 0 }}>
                Upcoming Hearings
              </h2>
              <a href="/vakil-sahayak" style={{ fontSize: 12, color: "var(--gold)", textDecoration: "none", fontWeight: 600 }}>View All →</a>
            </div>
            {stats?.recent_hearings && stats.recent_hearings.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {stats.recent_hearings.map(h => <HearingCard key={h.id} hearing={h} />)}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "32px 0", color: "var(--ink-muted)" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
                <div style={{ fontSize: 14 }}>No upcoming hearings</div>
                <a href="/vakil-sahayak" style={{ fontSize: 12, color: "var(--gold)", textDecoration: "none", marginTop: 8, display: "inline-block" }}>
                  Schedule a hearing →
                </a>
              </div>
            )}
          </div>

          {/* Recent Clients */}
          <div className="glass-panel" style={{ borderRadius: 16, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: "var(--forest)", margin: 0 }}>
                Recent Clients
              </h2>
              <a href="/vakil-sahayak" style={{ fontSize: 12, color: "var(--gold)", textDecoration: "none", fontWeight: 600 }}>View All →</a>
            </div>
            {clients.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {clients.map(c => (
                  <div key={c.id} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "12px 16px",
                    background: "var(--cream)",
                    borderRadius: 10,
                    border: "1px solid var(--border-color)",
                  }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: "50%",
                      background: "linear-gradient(135deg, var(--forest), var(--gold))",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontWeight: 700, fontSize: 15, flexShrink: 0,
                    }}>
                      {c.fullName[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.fullName}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--ink-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.caseTitle || "No case title"}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--ink-muted)", whiteSpace: "nowrap" }}>
                      {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "32px 0", color: "var(--ink-muted)" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
                <div style={{ fontSize: 14 }}>No clients yet</div>
                <a href="/vakil-sahayak" style={{ fontSize: 12, color: "var(--gold)", textDecoration: "none", marginTop: 8, display: "inline-block" }}>
                  Add your first client →
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div style={{
          marginTop: 24,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
        }}>
          {[
            { href: "/vakil-sahayak", icon: "⚖️", label: "Client CRM" },
            { href: "/documents", icon: "📄", label: "Draft Document" },
            { href: "/case-status", icon: "🔍", label: "Case Status" },
            { href: "/court-fee-calculator", icon: "🧮", label: "Court Fee Calc" },
            { href: "/chat", icon: "🤖", label: "AI Legal Help" },
            { href: "/news", icon: "📰", label: "Legal News" },
          ].map(({ href, icon, label }) => (
            <a key={href} href={href} className="glass-card" style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 18px",
              color: "var(--forest)",
              fontWeight: 600,
              fontSize: 13,
              textDecoration: "none",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--forest)"; (e.currentTarget as HTMLElement).style.color = "var(--gold-pale)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--ivory)"; (e.currentTarget as HTMLElement).style.color = "var(--forest)"; }}
            >
              <span style={{ fontSize: 20 }}>{icon}</span>
              {label}
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="stagger-5" style={{ textAlign: "center", padding: "32px 0 8px", color: "var(--ink-muted)", fontSize: 12 }}>
          Nyay Mitra · Advocate Dashboard · Data secured with AES-256 encryption
        </div>
      </div>
      </main>
    </div>
  );
}
