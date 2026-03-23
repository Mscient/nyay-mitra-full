import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage, LANGUAGES, type Language } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ThemeProvider";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Moon, Sun } from "lucide-react";

declare global {
  interface Window { google?: any; }
}

const GOOGLE_CLIENT_ID = "450969618266-iom7rkqvkfh1teb4p3tlupsq1hlgh041.apps.googleusercontent.com";

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const { t, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [lang, setLang] = useState<Language>("en");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initGoogle = () => {
      if (window.google?.accounts?.id && googleBtnRef.current) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "outline",
          size: "large",
          width: "100%",
          text: "signup_with",
          shape: "rectangular",
        });
      }
    };
    const timer = setTimeout(initGoogle, 500);
    return () => clearTimeout(timer);
  }, []);

  async function handleGoogleResponse(response: any) {
    setIsLoading(true);
    try {
      await loginWithGoogle(response.credential);
      navigate("/chat");
    } catch (err: any) {
      toast({ title: "Google sign-up failed", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Minimum 6 characters required", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await register(name, email, password, lang);
      setLanguage(lang);
      navigate("/chat");
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px",
    border: "1px solid var(--border-color)", borderRadius: 8,
    fontFamily: "'Instrument Sans', sans-serif", fontSize: 14,
    background: "var(--cream)", color: "var(--ink)", outline: "none",
    transition: "border-color 0.2s"
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 10, fontWeight: 600,
    letterSpacing: 1.5, textTransform: "uppercase",
    color: "var(--ink-muted)", marginBottom: 6
  };

  return (
    <div className="justice-bg" style={{ minHeight: "100vh", background: "var(--cream)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, position: "relative" }}>
      <button onClick={toggleTheme} style={{ position: "absolute", top: 20, right: 20, padding: 8, border: "none", background: "transparent", cursor: "pointer", color: "var(--ink-muted)" }}>
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* Logo */}
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 4 }}>
          <div style={{ width: 36, height: 36, background: "var(--forest)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <div style={{ width: 16, height: 16, border: "2px solid var(--gold)", borderRadius: "50%", position: "absolute" }} />
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, color: "var(--forest)" }}>Nyay Mitra</div>
        </div>
        <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--ink-muted)" }}>Your AI Legal Aid Assistant</div>
      </div>

      {/* Card */}
      <div style={{
        background: "var(--ivory)", borderRadius: "var(--radius-xl)",
        border: "1px solid var(--border-color)", boxShadow: "var(--shadow-lg)",
        padding: "40px 44px", width: "100%", maxWidth: 480
      }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 500, color: "var(--ink)", lineHeight: 1.1, marginBottom: 4 }}>Create Account</h1>
          <p style={{ fontSize: 13, color: "var(--ink-muted)" }}>Get free legal guidance in your language</p>
        </div>

        {/* Google Sign-Up */}
        <div ref={googleBtnRef} style={{ marginBottom: 20, width: "100%" }} />

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: "var(--border-color)" }} />
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--ink-faint)" }}>or register with email</span>
          <div style={{ flex: 1, height: 1, background: "var(--border-color)" }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input
              type="text" required value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Prashant Bhosale"
              data-testid="input-name"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = "var(--gold)")}
              onBlur={e => (e.target.style.borderColor = "var(--border-color)")}
            />
          </div>

          <div>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              data-testid="input-email"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = "var(--gold)")}
              onBlur={e => (e.target.style.borderColor = "var(--border-color)")}
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"} required value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                data-testid="input-password"
                style={{ ...inputStyle, paddingRight: 42 }}
                onFocus={e => (e.target.style.borderColor = "var(--gold)")}
                onBlur={e => (e.target.style.borderColor = "var(--border-color)")}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--ink-faint)" }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Preferred Language</label>
            <select
              value={lang}
              onChange={e => setLang(e.target.value as Language)}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              {(Object.entries(LANGUAGES) as [Language, { nativeLabel: string }][]).map(([code, info]) => (
                <option key={code} value={code}>{info.nativeLabel}</option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={isLoading} data-testid="button-register" style={{
            padding: "13px", background: "var(--forest)", color: "var(--gold-pale)",
            border: "none", borderRadius: 10, fontFamily: "'Instrument Sans', sans-serif",
            fontSize: 15, fontWeight: 600, cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.7 : 1, transition: "all 0.2s", marginTop: 4
          }}>
            {isLoading ? "Creating account…" : "Register"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ fontSize: 13, color: "var(--ink-muted)" }}>
            Already have an account?{" "}
            <Link href="/login">
              <span style={{ fontWeight: 700, color: "var(--ink)", cursor: "pointer" }}>Login</span>
            </Link>
          </p>
          <p>
            <button onClick={() => navigate("/chat")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-muted)", fontSize: 13 }}>
              Continue as Guest
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
