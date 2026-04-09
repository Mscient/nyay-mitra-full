"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

declare global { interface Window { google?: any; } }
const GOOGLE_CLIENT_ID = "450969618266-iom7rkqvkfh1teb4p3tlupsq1hlgh041.apps.googleusercontent.com";

const LANGUAGES = {
  en: { label: "English", nativeLabel: "English", flag: "🇬🇧" },
  hi: { label: "Hindi", nativeLabel: "हिंदी", flag: "🇮🇳" },
  mr: { label: "Marathi", nativeLabel: "मराठी", flag: "🇮🇳" },
};
type Language = keyof typeof LANGUAGES;

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams?.get("returnTo") || "/chat";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [lang, setLang] = useState<Language>("en");
  
  const [errors, setErrors] = useState<{name?: string; email?: string; password?: string}>({});
  const [touched, setTouched] = useState<{name?: boolean; email?: boolean; password?: boolean}>({});

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Inject Google script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    const initGoogle = () => {
      if (window.google?.accounts?.id && googleBtnRef.current) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "outline", size: "large", width: "100%", text: "signup_with", shape: "rectangular",
        });
      }
    };
    script.onload = () => setTimeout(initGoogle, 300);
    return () => { if (document.head.contains(script)) document.head.removeChild(script); };
  }, []);

  async function handleGoogleResponse(response: any) {
    setIsLoading(true); setGlobalError("");
    try {
      localStorage.setItem("nyay_token", "stub_google_jwt");
      localStorage.setItem("nyay_lang", lang);
      router.push(returnTo);
    } catch {
      setGlobalError("Google sign-up failed.");
    } finally {
      setIsLoading(false);
    }
  }

  const validateField = (field: "name" | "email" | "password", value: string) => {
    let err = undefined;
    if (field === "name" && value.trim().length < 2) err = "Name must be at least 2 characters";
    if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) err = "Enter a valid email address";
    if (field === "password" && value.length < 8) err = "Password must be at least 8 characters";
    
    setErrors(prev => ({ ...prev, [field]: err }));
    return !err;
  };

  const handleBlur = (field: "name" | "email" | "password", value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });
    
    if (!validateField("name", name) || !validateField("email", email) || !validateField("password", password)) return;

    setIsLoading(true); setGlobalError("");
    try {
      // Call local auth proxy which acts as a bridge to identity-svc
      const res = await fetch("/api/auth/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, lang })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      
      localStorage.setItem("nyay_token", data.token);
      localStorage.setItem("nyay_lang", lang);
      router.push(returnTo);
      router.refresh();
    } catch (err: any) {
      setGlobalError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const inputStyle = {
    width: "100%", padding: "12px 16px", border: "1.5px solid var(--border-color)", borderRadius: 10,
    fontFamily: "'Instrument Sans',sans-serif", fontSize: 16, color: "var(--ink)", background: "var(--cream)", outline: "none", boxSizing: "border-box" as const, transition: "border-color 0.2s"
  };
  const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink-mid)", marginBottom: 6 };

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Instrument Sans', sans-serif" }}>
      <nav style={{ position: "absolute", top: 24, left: 32 }}>
        <Link href="/" style={{ textDecoration: "none", fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--gold)" }}>← Back Home</Link>
      </nav>

      <div style={{ marginBottom: 32, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{ width: 36, height: 36, background: "var(--forest)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 16, height: 16, border: "2px solid var(--gold)", borderRadius: "50%" }} />
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600, color: "var(--ink)" }}>Nyay Mitra</h1>
        </div>
        <p style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--ink-muted)", fontWeight: 600 }}>Your AI Legal Aid Assistant</p>
      </div>

      <div style={{ background: "var(--ivory)", width: "100%", maxWidth: 420, borderRadius: 24, border: "1px solid var(--border-color)", padding: "40px 32px", boxShadow: "0 10px 40px rgba(0,0,0,0.03)" }}>
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 500, color: "var(--ink)", marginBottom: 8 }}>Create Account</h2>
          <p style={{ fontSize: 14, color: "var(--ink-muted)", lineHeight: 1.5 }}>Get free legal guidance in your preferred language.</p>
        </div>

        <div ref={googleBtnRef} style={{ width: "100%", marginBottom: 24, minHeight: 40 }} />

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 1, background: "var(--border-color)" }} />
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: "var(--ink-muted)" }}>or register with email</span>
          <div style={{ flex: 1, height: 1, background: "var(--border-color)" }} />
        </div>

        {globalError && (
          <div style={{ marginBottom: 20, padding: "12px 16px", background: "rgba(166,58,30,0.08)", border: "1px solid rgba(166,58,30,0.2)", borderRadius: 10, fontSize: 13, color: "#a63a1e", display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle size={16} /> {globalError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input type="text" value={name} onChange={e => { setName(e.target.value); if (touched.name) validateField("name", e.target.value); }} onBlur={() => handleBlur("name", name)} placeholder="Prashant Bhosale" style={{ ...inputStyle, borderColor: errors.name && touched.name ? "#a63a1e" : "var(--border-color)" }} onFocus={e => !errors.name && (e.target.style.borderColor = "var(--gold)")} />
            {errors.name && touched.name && <div style={{ fontSize: 12, color: "#a63a1e", marginTop: 6, fontWeight: 500 }}>{errors.name}</div>}
          </div>

          <div>
            <label style={labelStyle}>Email Address</label>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); if (touched.email) validateField("email", e.target.value); }} onBlur={() => handleBlur("email", email)} placeholder="you@example.com" style={{ ...inputStyle, borderColor: errors.email && touched.email ? "#a63a1e" : "var(--border-color)" }} onFocus={e => !errors.email && (e.target.style.borderColor = "var(--gold)")} />
            {errors.email && touched.email && <div style={{ fontSize: 12, color: "#a63a1e", marginTop: 6, fontWeight: 500 }}>{errors.email}</div>}
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <div style={{ position: "relative" }}>
              <input type={showPassword ? "text" : "password"} value={password} onChange={e => { setPassword(e.target.value); if (touched.password) validateField("password", e.target.value); }} onBlur={() => handleBlur("password", password)} placeholder="Min. 6 characters" style={{ ...inputStyle, borderColor: errors.password && touched.password ? "#a63a1e" : "var(--border-color)", paddingRight: 40 }} onFocus={e => !errors.password && (e.target.style.borderColor = "var(--gold)")} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--ink-muted)" }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && touched.password && <div style={{ fontSize: 12, color: "#a63a1e", marginTop: 6, fontWeight: 500 }}>{errors.password}</div>}
          </div>

          <div>
            <label style={labelStyle}>Preferred Language</label>
            <select value={lang} onChange={e => setLang(e.target.value as Language)} style={{ ...inputStyle, cursor: "pointer" }}>
              {(Object.entries(LANGUAGES) as [Language, typeof LANGUAGES[Language]][]).map(([code, info]) => (
                <option key={code} value={code}>{info.nativeLabel}</option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={isLoading} style={{ marginTop: 8, width: "100%", padding: "14px", background: isLoading ? "var(--ink-muted)" : "var(--forest)", color: "var(--gold-pale)", border: "none", borderRadius: 10, fontFamily: "'Instrument Sans',sans-serif", fontSize: 15, fontWeight: 600, cursor: isLoading ? "not-allowed" : "pointer", transition: "background 0.2s" }}>
            {isLoading ? "Creating account…" : "Register"}
          </button>
        </form>

        <div style={{ marginTop: 32, textAlign: "center", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 14, color: "var(--ink-muted)" }}>
            Already have an account?{" "}
            <Link href={`/login${returnTo !== "/chat" ? `?returnTo=${returnTo}` : ""}`} style={{ color: "var(--forest)", fontWeight: 700, textDecoration: "none" }}>Login</Link>
          </div>
          <button onClick={() => router.push(returnTo)} style={{ background: "transparent", border: "none", color: "var(--ink-muted)", fontSize: 14, cursor: "pointer", fontWeight: 500 }}>Continue as Guest</button>
        </div>
      </div>
    </div>
  );
}
