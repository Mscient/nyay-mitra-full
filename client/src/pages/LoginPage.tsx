import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Scale, Moon, Sun, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      navigate("/chat");
    } catch (err: any) {
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 justice-bg">
      {/* Background overlay */}
      <div className="absolute inset-0 z-0" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-flex items-center gap-3 cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
                <Scale className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="text-left">
                <div className="font-display text-2xl font-bold text-primary dark:text-primary">{t("appName")}</div>
                <div className="text-xs text-muted-foreground">{t("tagline")}</div>
              </div>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">{t("loginTitle")}</h1>
              <p className="text-sm text-muted-foreground mt-1">{t("loginSubtitle")}</p>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
              data-testid="toggle-theme"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                data-testid="input-email"
                className="bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">{t("password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  data-testid="input-password"
                  className="bg-background pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? "Signing in…" : t("login")}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <span className="text-sm text-muted-foreground">{t("dontHaveAccount")} </span>
            <Link href="/register">
              <span className="text-sm font-medium text-primary hover:underline cursor-pointer">{t("register")}</span>
            </Link>
          </div>

          <div className="mt-3 text-center">
            <Link href="/chat">
              <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer underline-offset-2 hover:underline">
                {t("continueAsGuest")}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
