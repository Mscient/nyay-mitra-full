import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage, LANGUAGES, type Language } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import {
  Scale, Moon, Sun, Shield, BookOpen, Users, Phone,
  ChevronRight, Gavel, FileText, Home, Briefcase,
  ShoppingCart, AlertTriangle, Heart, Globe
} from "lucide-react";

const CATEGORIES = [
  { key: "criminal", icon: Gavel, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/30", label: { en: "Criminal Law", hi: "आपराधिक कानून", mr: "फौजदारी कायदा" } },
  { key: "family", icon: Heart, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-950/30", label: { en: "Family & Marriage", hi: "परिवार और विवाह", mr: "कुटुंब व विवाह" } },
  { key: "labor", icon: Briefcase, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30", label: { en: "Labour Rights", hi: "श्रम अधिकार", mr: "कामगार हक्क" } },
  { key: "consumer", icon: ShoppingCart, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/30", label: { en: "Consumer Protection", hi: "उपभोक्ता संरक्षण", mr: "ग्राहक संरक्षण" } },
  { key: "property", icon: Home, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/30", label: { en: "Property & Rent", hi: "संपत्ति और किराया", mr: "मालमत्ता व भाडे" } },
  { key: "rti", icon: FileText, color: "text-teal-500", bg: "bg-teal-50 dark:bg-teal-950/30", label: { en: "RTI Act", hi: "आरटीआई अधिनियम", mr: "आरटीआय कायदा" } },
  { key: "constitutional", icon: BookOpen, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30", label: { en: "Constitutional Rights", hi: "संवैधानिक अधिकार", mr: "संवैधानिक हक्क" } },
  { key: "women", icon: Shield, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30", label: { en: "Women's Rights", hi: "महिला अधिकार", mr: "महिला हक्क" } },
];

const EMERGENCY = [
  { label: "Emergency", number: "112", color: "text-red-500" },
  { label: "Women Helpline", number: "181", color: "text-pink-500" },
  { label: "NALSA Legal Aid", number: "15100", color: "text-blue-500" },
  { label: "Consumer Helpline", number: "1800-11-4000", color: "text-green-500" },
  { label: "Child Helpline", number: "1098", color: "text-teal-500" },
];

export default function LandingPage() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [, navigate] = useLocation();

  function startChat(category?: string) {
    const path = category ? `/chat?category=${category}` : "/chat";
    navigate(path);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
              <Scale className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-foreground">{t("appName")}</span>
              <span className="ml-2 text-xs text-muted-foreground hidden sm:inline">न्याय मित्र</span>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Language switcher */}
            <div className="flex items-center gap-0.5 bg-muted rounded-lg p-1">
              {(Object.keys(LANGUAGES) as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  data-testid={`lang-${l}`}
                  className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${language === l
                    ? "bg-card shadow text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {LANGUAGES[l].nativeLabel}
                </button>
              ))}
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
              data-testid="toggle-theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {user.name.split(" ")[0]}
                </span>
                <Button size="sm" onClick={() => navigate("/chat")} className="bg-primary text-primary-foreground">
                  {t("myConsultations")}
                </Button>
                <Button size="sm" variant="ghost" onClick={logout}>{t("logout")}</Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button size="sm" variant="ghost">{t("login")}</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-primary text-primary-foreground">{t("register")}</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="justice-bg relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/20 text-secondary-foreground dark:text-secondary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Globe className="w-4 h-4" />
            Available in English · हिंदी · मराठी
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4 leading-tight">
            {t("heroTitle")}
            <br />
            <span className="text-primary dark:text-secondary">Free Legal Guidance.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            {t("heroSubtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 shadow-lg"
              onClick={() => startChat()}
              data-testid="button-start-chat"
            >
              {t("startChat")}
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
            {!user && (
              <Link href="/register">
                <Button size="lg" variant="outline" className="border-primary/30 font-medium">
                  {t("register")} — Free
                </Button>
              </Link>
            )}
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-green-500" /> 100% Free</div>
            <div className="flex items-center gap-1.5"><Scale className="w-4 h-4 text-blue-500" /> Indian Law Focused</div>
            <div className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-teal-500" /> 3 Languages</div>
            <div className="flex items-center gap-1.5"><Users className="w-4 h-4 text-purple-500" /> Rural-Friendly</div>
          </div>
        </div>
      </section>

      {/* ── Legal Categories ── */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">{t("categories")}</h2>
            <p className="text-muted-foreground">Select a topic to get targeted legal guidance</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const label = cat.label[language as keyof typeof cat.label] || cat.label.en;
              return (
                <button
                  key={cat.key}
                  onClick={() => startChat(cat.key)}
                  data-testid={`category-${cat.key}`}
                  className={`${cat.bg} border border-border rounded-xl p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all group`}
                >
                  <Icon className={`w-8 h-8 ${cat.color} mb-3 group-hover:scale-110 transition-transform`} />
                  <div className="font-semibold text-foreground text-sm leading-tight">{label}</div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">How It Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Choose a Category", desc: "Select the area of law relevant to your situation — or ask anything directly." },
              { step: "2", title: "Ask Your Question", desc: "Describe your situation in English, Hindi, or Marathi. No legal jargon needed." },
              { step: "3", title: "Get Guidance", desc: "Receive clear answers with exact law citations — Section numbers, Acts, and next steps." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center mx-auto mb-4">
                  <span className="font-display font-bold text-primary text-lg">{item.step}</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Emergency Banner ── */}
      <section className="py-10 bg-red-50 dark:bg-red-950/20 border-y border-red-200 dark:border-red-900/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <h2 className="font-semibold text-red-700 dark:text-red-400">{t("emergencyTitle")}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {EMERGENCY.map((e) => (
              <div key={e.number} className="bg-white dark:bg-card rounded-lg p-3 shadow-sm border border-border">
                <div className={`font-bold text-lg ${e.color}`}>{e.number}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{e.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground space-y-2">
          <p className="max-w-2xl mx-auto">{t("disclaimer")}</p>
          <p>
            <a href="https://www.perplexity.ai/computer" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              Created with Perplexity Computer
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
