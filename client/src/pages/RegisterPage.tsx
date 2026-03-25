import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage, LANGUAGES, type Language } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ThemeProvider";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Moon, Sun, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

declare global {
  interface Window { google?: any; }
}

const GOOGLE_CLIENT_ID = "450969618266-iom7rkqvkfh1teb4p3tlupsq1hlgh041.apps.googleusercontent.com";

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const { setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [lang, setLang] = useState<Language>("en");
  
  const [errors, setErrors] = useState<{name?: string; email?: string; password?: string}>({});
  const [touched, setTouched] = useState<{name?: boolean; email?: boolean; password?: boolean}>({});

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const returnTo = new URLSearchParams(window.location.search).get("returnTo") || "/chat";

  useEffect(() => {
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
    const timer = setTimeout(initGoogle, 500);
    return () => clearTimeout(timer);
  }, []);

  async function handleGoogleResponse(response: any) {
    setIsLoading(true);
    try {
      await loginWithGoogle(response.credential);
      navigate(returnTo);
    } catch (err: any) {
      toast({ title: "Google sign-up failed", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  const validateField = (field: "name" | "email" | "password", value: string) => {
    let error = undefined;
    if (field === "name" && value.trim().length < 2) error = "Name must be at least 2 characters";
    if (field === "email" && !/^\S+@\S+\.\S+$/.test(value)) error = "Enter a valid email address";
    if (field === "password" && value.length < 6) error = "Password must be at least 6 characters";
    
    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  const handleBlur = (field: "name" | "email" | "password", value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });
    
    const isNameValid = validateField("name", name);
    const isEmailValid = validateField("email", email);
    const isPasswordValid = validateField("password", password);
    
    if (!isNameValid || !isEmailValid || !isPasswordValid) return;

    setIsLoading(true);
    try {
      await register(name, email, password, lang);
      setLanguage(lang);
      navigate(returnTo);
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="justice-bg min-h-screen bg-background flex flex-col items-center justify-center p-6 relative">
      <Button variant="ghost" size="icon" onClick={toggleTheme} className="absolute top-6 right-6 text-muted-foreground">
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </Button>

      {/* Logo */}
      <div className="mb-8 text-center flex flex-col items-center">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center relative">
            <div className="w-4 h-4 border-2 border-secondary rounded-full absolute" />
          </div>
          <h1 className="font-display text-3xl font-bold text-primary dark:text-primary-foreground">Nyay Mitra</h1>
        </div>
        <p className="text-xs tracking-widest uppercase text-muted-foreground font-semibold">Your AI Legal Aid Assistant</p>
      </div>

      {/* Card */}
      <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-lg p-8 sm:p-10 relative overflow-hidden">
        <div className="mb-8">
          <h2 className="font-display text-3xl font-semibold text-foreground leading-tight mb-2">Create Account</h2>
          <p className="text-sm text-muted-foreground">Get free legal guidance in your language</p>
        </div>

        {/* Google Sign-Up */}
        <div ref={googleBtnRef} className="mb-6 w-full" />

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground/70">or register with email</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="name" className={errors.name && touched.name ? "text-destructive" : ""}>Full Name</Label>
            <Input
              id="name" type="text" value={name}
              onChange={e => { setName(e.target.value); if (touched.name) validateField("name", e.target.value); }}
              onBlur={() => handleBlur("name", name)}
              placeholder="Prashant Bhosale"
              aria-invalid={!!(errors.name && touched.name)}
              className={errors.name && touched.name ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.name && touched.name && (
              <p className="text-[11px] font-medium text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className={errors.email && touched.email ? "text-destructive" : ""}>Email Address</Label>
            <Input
              id="email" type="email" value={email}
              onChange={e => { setEmail(e.target.value); if (touched.email) validateField("email", e.target.value); }}
              onBlur={() => handleBlur("email", email)}
              placeholder="you@example.com"
              aria-invalid={!!(errors.email && touched.email)}
              className={errors.email && touched.email ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.email && touched.email && (
              <p className="text-[11px] font-medium text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className={errors.password && touched.password ? "text-destructive" : ""}>Password</Label>
            <div className="relative">
              <Input
                id="password" type={showPassword ? "text" : "password"} value={password}
                onChange={e => { setPassword(e.target.value); if (touched.password) validateField("password", e.target.value); }}
                onBlur={() => handleBlur("password", password)}
                placeholder="Min. 6 characters"
                className={`pr-10 ${errors.password && touched.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                aria-invalid={!!(errors.password && touched.password)}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && touched.password && (
              <p className="text-[11px] font-medium text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> {errors.password}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Preferred Language</Label>
            <select
              id="language"
              value={lang}
              onChange={e => setLang(e.target.value as Language)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {(Object.entries(LANGUAGES) as [Language, { nativeLabel: string }][]).map(([code, info]) => (
                <option key={code} value={code}>{info.nativeLabel}</option>
              ))}
            </select>
          </div>

          <Button type="submit" className="w-full mt-2" size="lg" disabled={isLoading}>
            {isLoading ? "Creating account…" : "Register"}
          </Button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href={`/login${window.location.search}`}>
              <span className="font-bold text-foreground hover:text-primary cursor-pointer transition-colors">Login</span>
            </Link>
          </p>
          <Button variant="ghost" onClick={() => navigate("/chat")} className="text-sm text-muted-foreground">
            Continue as Guest
          </Button>
        </div>
      </div>
    </div>
  );
}
