import { useState, useEffect } from "react";
import { Shield, X, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

const CONSENT_KEY = "nyay_mitra_dpdp_consent_v1";

export function DPDPConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Show banner only if user hasn't already consented
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      // Small timeout to avoid layout flash on first load
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
      accepted: true,
      timestamp: new Date().toISOString(),
      version: "1.0",
    }));
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
      accepted: false,
      timestamp: new Date().toISOString(),
      version: "1.0",
    }));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50 p-4 md:p-0 md:bottom-6 md:right-6 md:left-auto md:max-w-md animate-in slide-in-from-bottom-4 duration-300"
      role="dialog"
      aria-labelledby="dpdp-title"
      aria-describedby="dpdp-desc"
    >
      <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-primary/5 border-b border-border px-5 py-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 id="dpdp-title" className="font-semibold text-foreground text-sm">Data Privacy Notice</h2>
            <p className="text-xs text-muted-foreground">DPDP Act 2023 — Your rights, our obligations</p>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={handleDecline} aria-label="Dismiss">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          <p id="dpdp-desc" className="text-sm text-muted-foreground leading-relaxed">
            Nyay Mitra collects minimal data to provide you with legal assistance. Under the{" "}
            <strong className="text-foreground font-medium">Digital Personal Data Protection Act 2023</strong>, you have rights to access, correct, and delete your personal data.
          </p>

          {showDetails && (
            <div className="rounded-xl bg-muted/40 p-4 text-xs text-muted-foreground space-y-2 border border-border/50">
              <p><strong className="text-foreground">What we collect:</strong> Name, email, query history, session data.</p>
              <p><strong className="text-foreground">Why:</strong> To personalise legal guidance and save your consultations.</p>
              <p><strong className="text-foreground">Storage:</strong> All data stored within India (DPDP compliant).</p>
              <p><strong className="text-foreground">Your rights:</strong> Access, correct, or delete your data anytime from your account settings.</p>
              <p><strong className="text-foreground">Retention:</strong> Data deleted within 30 days of account deletion.</p>
              <p><strong className="text-foreground">Legal basis:</strong> Consent (you may withdraw at any time).</p>
            </div>
          )}

          <button
            className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Hide details" : "Read full details"}
            <ChevronRight className={`h-3 w-3 transition-transform ${showDetails ? "rotate-90" : ""}`} />
          </button>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex gap-3">
          <Button variant="outline" size="sm" className="flex-1" onClick={handleDecline}>
            Essential only
          </Button>
          <Button size="sm" className="flex-1 font-semibold" onClick={handleAccept}>
            Accept & Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
