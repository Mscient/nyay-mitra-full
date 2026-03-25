import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage, LANGUAGES, type Language } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ThemeProvider";
import { Moon, Sun } from "lucide-react";

const FEATURES = [
  { icon: "⚡", title: "Sarvam AI Backbone", desc: "Native Indian-language LLM trained on 4B+ tokens. Understands khatauni, tehsildar, adalat — not just English." },
  { icon: "🎙️", title: "Voice Agents", desc: "Call a number, speak in Bhojpuri, get a legal answer spoken back. No smartphone. No data plan. No literacy required." },
  { icon: "📚", title: "RAG-Grounded", desc: "Every answer cites real IndianKanoon judgments and NALSA documents. Zero hallucinations by design." },
  { icon: "🔒", title: "India-Hosted", desc: "All data stays in AWS Mumbai. DPDP Act 2023 compliant. Sensitive legal conversations never leave Indian servers." },
  { icon: "⚖️", title: "NALSA Aligned", desc: "Modelled on the government's own Nyay Marg initiative. Free for all NALSA-eligible citizens." },
  { icon: "📱", title: "USSD Fallback", desc: "*123# works on any mobile network without internet. Reaching India's truly last-mile population." },
];

const CITIZEN_FEATURES = [
  "AI legal Q&A in 22 Indian languages with case law citations",
  "Auto-generates RTI applications, legal notices, bail petitions",
  "NALSA eligibility checker and free legal aid connector",
  "WhatsApp & voice agent — works on 2G, no app needed",
];

const LAWYER_FEATURES = [
  "Semantic search across 50,000+ Supreme Court & HC judgments",
  "Precedent strength — good law vs overruled, instantly",
  "Section 436A undertrial tracker with automatic bail alerts",
  "AI-assisted draft studio and hearing calendar",
];

export default function LandingPage() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [, navigate] = useLocation();

  function startChat() { navigate("/chat"); }

  return (
    <div style={{ background: "var(--cream)", minHeight: "100vh", fontFamily: "'Instrument Sans', sans-serif" }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(249,245,238,0.92)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border-gold)",
        padding: "0 48px", height: 68,
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        {/* Logo */}
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 14, textDecoration: "none" }}>
          <div style={{
            width: 36, height: 36,
            background: "var(--forest)",
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative"
          }}>
            <div style={{
              width: 16, height: 16,
              border: "2px solid var(--gold)",
              borderRadius: "50%", position: "absolute"
            }} />
          </div>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: "var(--forest)", letterSpacing: 0.2 }}>Nyay Mitra</div>
            <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: 2, textTransform: "uppercase", color: "var(--ink-muted)", display: "block", lineHeight: 1, marginTop: 2 }}>AI Legal Platform</div>
          </div>
        </a>

        {/* Centre links */}
        <div style={{ display: "flex", gap: 2 }}>
          <Link href="/chat"><span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-mid)", padding: "8px 14px", borderRadius: 6, cursor: "pointer" }}>Legal Aid Chat</span></Link>
          <Link href="/documents"><span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-mid)", padding: "8px 14px", borderRadius: 6, cursor: "pointer" }}>Document Generator</span></Link>
          <Link href="/nalsa-check"><span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-mid)", padding: "8px 14px", borderRadius: 6, cursor: "pointer" }}>NALSA Check</span></Link>
          <Link href="/vakil-sahayak"><span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-mid)", padding: "8px 14px", borderRadius: 6, cursor: "pointer" }}>Vakil Sahayak</span></Link>
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Language */}
          <div style={{ display: "flex", gap: 2, background: "var(--cream-dark)", borderRadius: 8, padding: 3 }}>
            {(Object.keys(LANGUAGES) as Language[]).map((l) => (
              <button key={l} onClick={() => setLanguage(l)} style={{
                padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 500, fontFamily: "'Instrument Sans', sans-serif",
                background: language === l ? "var(--ivory)" : "transparent",
                color: language === l ? "var(--ink)" : "var(--ink-muted)",
                boxShadow: language === l ? "var(--shadow-sm)" : "none",
                transition: "all 0.15s"
              }}>
                {LANGUAGES[l].nativeLabel}
              </button>
            ))}
          </div>

          <button onClick={toggleTheme} style={{ padding: 8, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", color: "var(--ink-muted)" }}>
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {user ? (
            <>
              <button onClick={() => navigate("/chat")} style={{
                padding: "9px 20px", background: "var(--forest)", color: "var(--gold-pale)",
                border: "none", borderRadius: 8, fontFamily: "'Instrument Sans', sans-serif",
                fontSize: 13, fontWeight: 600, cursor: "pointer"
              }}>My Consultations</button>
              <button onClick={logout} style={{
                padding: "9px 16px", background: "transparent", color: "var(--ink-mid)",
                border: "1px solid var(--border-color)", borderRadius: 8,
                fontFamily: "'Instrument Sans', sans-serif", fontSize: 13, cursor: "pointer"
              }}>Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/login">
                <button style={{
                  padding: "9px 20px", background: "transparent", color: "var(--ink-mid)",
                  border: "1px solid var(--border-color)", borderRadius: 8,
                  fontFamily: "'Instrument Sans', sans-serif", fontSize: 13, fontWeight: 500, cursor: "pointer"
                }}>Sign In</button>
              </Link>
              <button onClick={startChat} style={{
                padding: "9px 22px", background: "var(--gold)", color: "var(--ivory)",
                border: "none", borderRadius: 8, fontFamily: "'Instrument Sans', sans-serif",
                fontSize: 13, fontWeight: 600, cursor: "pointer", letterSpacing: 0.3
              }}>Get Legal Help</button>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="justice-bg" style={{
        minHeight: "100vh",
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "140px 48px 80px",
        position: "relative", overflow: "hidden"
      }}>
        {/* Mandala SVG */}
        <svg style={{ position: "absolute", right: -100, top: "50%", transform: "translateY(-50%)", width: 700, height: 700, opacity: 0.14, pointerEvents: "none" }} viewBox="0 0 700 700" fill="none">
          <circle cx="350" cy="350" r="300" stroke="#1A2E1A" strokeWidth="1"/>
          <circle cx="350" cy="350" r="240" stroke="#1A2E1A" strokeWidth="0.5"/>
          <circle cx="350" cy="350" r="180" stroke="#1A2E1A" strokeWidth="0.5"/>
          <circle cx="350" cy="350" r="120" stroke="#1A2E1A" strokeWidth="0.5"/>
          <circle cx="350" cy="350" r="60" stroke="#C9920A" strokeWidth="1"/>
          <line x1="350" y1="50" x2="350" y2="650" stroke="#1A2E1A" strokeWidth="0.5"/>
          <line x1="50" y1="350" x2="650" y2="350" stroke="#1A2E1A" strokeWidth="0.5"/>
          <line x1="137" y1="137" x2="563" y2="563" stroke="#1A2E1A" strokeWidth="0.5"/>
          <line x1="563" y1="137" x2="137" y2="563" stroke="#1A2E1A" strokeWidth="0.5"/>
          <polygon points="350,50 638,513 62,513" stroke="#C9920A" strokeWidth="0.5" fill="none" opacity="0.4"/>
          <polygon points="350,650 62,187 638,187" stroke="#C9920A" strokeWidth="0.5" fill="none" opacity="0.4"/>
        </svg>

        {/* Badge */}
        <div className="animate-fade-up" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "var(--gold-whisper)", border: "1px solid var(--border-gold)",
          padding: "6px 16px", borderRadius: 20, marginBottom: 32, width: "fit-content"
        }}>
          <div className="gold-pulse" />
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--gold)" }}>
            NALSA Validated · Available Free
          </span>
        </div>

        {/* Title */}
        <div className="animate-fade-up" style={{ maxWidth: 720, marginBottom: 12 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(48px, 7vw, 88px)", fontWeight: 300, lineHeight: 1.0, letterSpacing: -1, color: "var(--ink)" }}>
            Justice in Your<br />
            <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Language,</em><br />
            At Your Fingertips
          </div>
        </div>

        {/* Hindi tagline */}
        <div className="animate-fade-up t-devanagari" style={{ fontSize: "clamp(16px,2.5vw,22px)", color: "var(--gold)", fontWeight: 300, letterSpacing: 1, marginBottom: 24 }}>
          न्याय आपकी भाषा में — हर नागरिक के लिए
        </div>

        <p className="animate-fade-up" style={{ maxWidth: 560, fontSize: 15, lineHeight: 1.75, color: "var(--ink-mid)", marginBottom: 48 }}>
          India's most comprehensive AI legal platform — serving rural citizens while empowering lawyers with intelligent case research tools.
        </p>

        {/* CTAs */}
        <div className="animate-fade-up" style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <button onClick={startChat} data-testid="button-start-chat" style={{
            fontFamily: "'Instrument Sans', sans-serif", fontSize: 14, fontWeight: 600,
            padding: "14px 32px", background: "var(--forest)", color: "var(--gold-pale)",
            border: "none", borderRadius: 10, cursor: "pointer", transition: "all 0.25s",
            display: "flex", alignItems: "center", gap: 10
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            I Need Legal Help
          </button>
          <Link href="/login">
            <button style={{
              fontFamily: "'Instrument Sans', sans-serif", fontSize: 14, fontWeight: 500,
              padding: "14px 32px", background: "transparent", color: "var(--forest)",
              border: "1.5px solid var(--forest)", borderRadius: 10, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 10, transition: "all 0.25s"
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Lawyer / Advocate Portal
            </button>
          </Link>
        </div>

        {/* Gold rule */}
        <div className="gold-rule animate-fade-up" />

        {/* Stats */}
        <div className="animate-fade-up" style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
          {[["22+","Indian Languages"],["50K+","Case Laws Indexed"],["84M","Citizens Underserved"],["Free","For NALSA Eligible"]].map(([n,l]) => (
            <div key={l}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 600, color: "var(--forest)", lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: 0.5, color: "var(--ink-muted)", marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PORTAL CARDS ── */}
      <section style={{ padding: "96px 48px", background: "var(--ivory)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 60 }}>
            <div className="t-label" style={{ marginBottom: 12 }}>Choose your portal</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: 500, color: "var(--ink)" }}>Two sides. One mission.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Citizen Card */}
            <div className="portal-card" onClick={startChat}>
              <div style={{ padding: "44px 40px 36px", background: "var(--forest)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", right: -60, top: -60, width: 200, height: 200, borderRadius: "50%", border: "40px solid rgba(255,255,255,0.12)" }} />
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2.5, textTransform: "uppercase", color: "var(--gold)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 20, height: 1, background: "var(--gold)", display: "inline-block" }} />
                  For Citizens
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 500, color: "var(--ivory)", lineHeight: 1.1, marginBottom: 12 }}>Nagrik Sahayak</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, maxWidth: 320 }}>Know your rights, get legal guidance in your own language — via chat, voice, or WhatsApp.</div>
              </div>
              <div style={{ background: "var(--ivory)", padding: "28px 40px 36px" }}>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {CITIZEN_FEATURES.map(f => (
                    <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border-color)", fontSize: 13.5, color: "var(--ink-mid)", lineHeight: 1.5 }}>
                      <div style={{ width: 16, height: 1, background: "var(--gold)", marginTop: 9, flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border-gold)" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--forest)" }}>Get Legal Help</span>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--forest)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ivory)", fontSize: 16, transition: "all 0.2s" }}>→</div>
                </div>
              </div>
            </div>

            {/* Lawyer Card */}
            <div className="portal-card" onClick={() => navigate("/vakil-sahayak")}>
              <div style={{ padding: "44px 40px 36px", background: "var(--ink)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", right: -60, top: -60, width: 200, height: 200, borderRadius: "50%", border: "40px solid rgba(255,255,255,0.12)" }} />
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2.5, textTransform: "uppercase", color: "var(--gold)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 20, height: 1, background: "var(--gold)", display: "inline-block" }} />
                  For Advocates
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 500, color: "var(--ivory)", lineHeight: 1.1, marginBottom: 12 }}>Vakil Sahayak</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, maxWidth: 320 }}>AI-powered case law research, precedent analysis, and practice intelligence.</div>
              </div>
              <div style={{ background: "var(--ivory)", padding: "28px 40px 36px" }}>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {LAWYER_FEATURES.map(f => (
                    <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border-color)", fontSize: 13.5, color: "var(--ink-mid)", lineHeight: 1.5 }}>
                      <div style={{ width: 16, height: 1, background: "var(--gold)", marginTop: 9, flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border-gold)" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--forest)" }}>Enter Vakil Sahayak</span>
                  <Link href="/vakil-sahayak" onClick={e => e.stopPropagation()}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--forest)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ivory)", fontSize: 16 }}>→</div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TOOLS SECTION ── */}
      <section style={{ padding: "80px 48px", background: "var(--cream)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2.5, textTransform: "uppercase", color: "var(--gold)", marginBottom: 12 }}>Self-Service Legal Tools</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px,4vw,40px)", fontWeight: 500, color: "var(--ink)" }}>Everything you need, right here</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
            {[
              { href: "/documents", emoji: "📄", title: "Document Generator", desc: "Draft RTI applications, legal notices, bail petitions, consumer complaints in minutes.", tag: "5 Templates" },
              { href: "/nalsa-check", emoji: "✅", title: "NALSA Eligibility", desc: "5-question check to see if you qualify for government free legal aid.", tag: "Instant Result" },
              { href: "/undertrial-tracker", emoji: "⚖️", title: "Undertrial Tracker (436A)", desc: "Calculate if an undertrial is eligible for bail under Section 436A CrPC.", tag: "Legal Calculator" },
              { href: "/vakil-sahayak", emoji: "🔍", title: "Vakil Sahayak", desc: "AI case law research, client tracker, draft studio and hearing calendar for advocates.", tag: "For Lawyers" },
              { href: "/legal-news", emoji: "📰", title: "Legal News", desc: "Live updates from LiveLaw and Bar & Bench — new judgments, amendments, and legal developments.", tag: "Live RSS Feed" },
              { href: "/financial-aid", emoji: "🏦", title: "Financial Aid Guide", desc: "Step-by-step guide for SARFAESI, cheque bounce Sec 138, income tax notices, and banking ombudsman.", tag: "6 Modules" },
              { href: "/know-your-rights", emoji: "📚", title: "Know Your Rights", desc: "Plain-language explainers for IPC, CrPC, RTI, Consumer Protection, DV Act — with FIR assistant.", tag: "Citizen Guide" },
              { href: "/startup-hub", emoji: "🚀", title: "Startup Legal Hub", desc: "Incorporation checklist, compliance calendar, key agreements, and IP guide for early-stage founders.", tag: "Founder Suite" },
            ].map(tool => (
              <Link key={tool.href} href={tool.href} style={{ textDecoration: "none" }}>
                <div
                  style={{ background: "var(--ivory)", border: "1px solid var(--border-color)", borderRadius: 16, padding: "28px 24px", cursor: "pointer", transition: "all 0.25s", height: "100%" }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = "var(--border-gold)"; el.style.transform = "translateY(-4px)"; el.style.boxShadow = "var(--shadow)"; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = "var(--border-color)"; el.style.transform = "none"; el.style.boxShadow = "none"; }}
                >
                  <div style={{ fontSize: 30, marginBottom: 14 }}>{tool.emoji}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: "var(--ink)" }}>{tool.title}</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--gold)", marginBottom: 10 }}>{tool.tag}</div>
                  <div style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6 }}>{tool.desc}</div>
                  <div style={{ marginTop: 20, fontSize: 12, fontWeight: 600, color: "var(--forest)", display: "flex", alignItems: "center", gap: 6 }}>Open →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES DARK ── */}
      <section style={{ padding: "96px 48px", background: "var(--forest)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 60 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>Why Nyay Mitra</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: 500, color: "var(--ivory)" }}>
              Built for <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Bharat,</em> not just India
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {FEATURES.map(f => (
              <div key={f.title} className="feat-card">
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(201,146,10,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 16, border: "1px solid rgba(201,146,10,0.2)" }}>
                  {f.icon}
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 500, color: "var(--ivory)", marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.65 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EMERGENCY NUMBERS ── */}
      <section style={{ padding: "56px 48px", background: "var(--rust-light)", borderTop: "1px solid rgba(166,58,30,0.15)", borderBottom: "1px solid rgba(166,58,30,0.15)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <span style={{ fontWeight: 600, color: "var(--rust)" }}>Emergency Helplines</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
            {[["112","Emergency"],["181","Women Helpline"],["15100","NALSA Legal Aid"],["1800-11-4000","Consumer Help"],["1098","Child Helpline"]].map(([num, label]) => (
              <div key={num} style={{ background: "var(--ivory)", borderRadius: 10, padding: "14px 16px", border: "1px solid var(--border-color)" }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, color: "var(--rust)", lineHeight: 1 }}>{num}</div>
                <div style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 4, fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "var(--ink)", padding: "48px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 500, color: "var(--ivory)", marginBottom: 4 }}>Nyay Mitra</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>Built for India · Sarvam AI + IndianKanoon + NALSA<br />Not a substitute for professional legal advice.</div>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {["Privacy Policy","Terms of Use","NALSA Helpline: 15100","Contact"].map(l => (
            <a key={l} href="#" style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
