"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CourtFeeCalculatorPage() {
  const [state, setState] = useState("maharashtra");
  const [suitType, setSuitType] = useState("money");
  const [suitValue, setSuitValue] = useState("");
  const [fee, setFee] = useState<{ total: number; isFixed: boolean; breakdown: string } | null>(null);
  
  const calculateFee = () => {
    let totalFee = 0;
    let isFixed = false;
    let breakdown = "";

    // 1. Matrimonial Dispute
    if (suitType === "matrimonial") {
      isFixed = true;
      if (state === "maharashtra") { totalFee = 100; }
      else if (state === "delhi") { totalFee = 50; }
      else if (state === "karnataka") { totalFee = 100; }
      else { totalFee = 100; }
      breakdown = "Fixed fee for matrimonial disputes under relevant State schedule.";
    }
    // 2. Suit for Declaration (Without consequential relief)
    else if (suitType === "declaration") {
      isFixed = true;
      if (state === "maharashtra") { totalFee = 600; } // Bombay Court Fees Act Schedule II Article 4
      else if (state === "delhi") { totalFee = 200; }
      else if (state === "karnataka") { totalFee = 200; }
      else { totalFee = 300; }
      breakdown = "Fixed fee for declaration (without consequential relief) under State act.";
    }
    // 3. Suit for Injunction
    else if (suitType === "injunction") {
      isFixed = true;
      if (state === "maharashtra") { totalFee = 1000; }
      else if (state === "delhi") { totalFee = 150; }
      else if (state === "karnataka") { totalFee = 250; }
      else { totalFee = 500; }
      breakdown = "Fixed minimum fee for injunction under State schedule.";
    }
    // 4. Suit for Recovery of Money (Ad Valorem)
    else {
      isFixed = false;
      const value = parseFloat(suitValue);
      if (isNaN(value) || value < 0) return setFee({ total: 0, isFixed: false, breakdown: "Invalid valuation." });

      if (state === "maharashtra") {
        // Approximate ad-valorem: ~2-5% tapering, bounded by maximum Rs 3,00,000
        totalFee = value * 0.05; // Simplifying the initial slab
        if (value > 10000) totalFee = 500 + (value - 10000) * 0.04;
        if (value > 100000) totalFee = 4100 + (value - 100000) * 0.02;
        if (totalFee > 300000) totalFee = 300000; // Hard cap
        breakdown = `Ad-valorem calculation. Maximum ceiling of ₹3,00,000 applies strictly in Maharashtra under the Bombay Court Fees Act 1959.`;
      } else if (state === "delhi") {
        // ~1.5% - 2% ad valorem
        totalFee = value * 0.02;
        breakdown = `Ad-valorem calculation mapped to ~2% per NCT Delhi Schedule I.`;
      } else if (state === "karnataka") {
        totalFee = value * 0.04;
        breakdown = `Ad-valorem calculation approximated at ~4% for Karnataka state jurisdiction.`;
      } else {
        totalFee = value * 0.025;
        breakdown = `Generic ad-valorem estimating at 2.5% for unmodified jurisdictions.`;
      }
      
      // Ensure there evaluates a base cost
      if (totalFee < 100) totalFee = 100;
    }

    setFee({ total: totalFee, isFixed, breakdown });
  };

  const showValuationInput = suitType === "money";

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", fontFamily: "'Instrument Sans', sans-serif" }}>
      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(249,245,238,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border-gold)", padding: "0 32px", height: 60, display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/vakil-sahayak" style={{ textDecoration: "none" }}><span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--gold)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><ArrowLeft size={14} /> Back to Vakil Sahayak</span></Link>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 500, color: "var(--ink)" }}>Court Fee Calculator</div>
      </nav>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "100px 32px 60px" }}>
        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold)", marginBottom: 8 }}>Legal Utility</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 52, fontWeight: 500, color: "var(--ink)", lineHeight: 1.1 }}>Stamp Duty & Court Fee <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Calculator</em></h1>
          <p className="t-body" style={{ marginTop: 12, maxWidth: 600, margin: "12px auto 0" }}>Estimate ad-valorem or fixed court fees for civil suits based on state jurisdictions and the specific nature of relief.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 32, alignItems: "start" }}>
          <div style={{ background: "var(--ivory)", border: "1px solid var(--border-color)", borderRadius: 24, padding: "32px clamp(20px, 4vw, 32px)", boxShadow: "var(--shadow-sm)" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 500, color: "var(--ink)", marginBottom: 24, borderBottom: "1px solid var(--border-gold)", paddingBottom: 16 }}>Suit Parameters</h2>
            
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 8 }}>Jurisdiction (State)</label>
              <select 
                value={state} 
                onChange={e => { setState(e.target.value); setFee(null); }}
                style={{ width: "100%", padding: "14px", border: "1px solid var(--border-color)", borderRadius: 12, fontFamily: "'Instrument Sans',sans-serif", fontSize: 15, color: "var(--ink)", background: "var(--cream)", outline: "none", appearance: "none", cursor: "pointer" }}
              >
                <option value="maharashtra">Maharashtra</option>
                <option value="delhi">Delhi</option>
                <option value="karnataka">Karnataka</option>
                <option value="other">Other States</option>
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 8 }}>Nature of Suit</label>
              <select 
                value={suitType} 
                onChange={e => { setSuitType(e.target.value); setFee(null); }}
                style={{ width: "100%", padding: "14px", border: "1px solid var(--border-color)", borderRadius: 12, fontFamily: "'Instrument Sans',sans-serif", fontSize: 15, color: "var(--ink)", background: "var(--cream)", outline: "none", appearance: "none", cursor: "pointer" }}
              >
                <option value="money">Suit for Recovery of Money (Ad Valorem)</option>
                <option value="declaration">Suit for Declaration (no consequential relief)</option>
                <option value="injunction">Suit for Injunction</option>
                <option value="matrimonial">Matrimonial Dispute (e.g., Divorce)</option>
              </select>
            </div>

            {showValuationInput && (
              <div style={{ marginBottom: 32 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 8 }}>Valuation of Suit (INR)</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "var(--ink-muted)", fontWeight: 500 }}>₹</span>
                  <input 
                    type="number" 
                    value={suitValue} 
                    onChange={e => { setSuitValue(e.target.value); setFee(null); }}
                    placeholder="e.g. 500000"
                    style={{ width: "100%", padding: "14px 16px 14px 40px", border: "1px solid var(--border-color)", borderRadius: 12, fontFamily: "'Instrument Sans',sans-serif", fontSize: 18, color: "var(--ink)", background: "var(--cream)", outline: "none" }}
                    onFocus={e => (e.target.style.borderColor = "var(--gold)")}
                    onBlur={e => (e.target.style.borderColor = "var(--border-color)")}
                  />
                </div>
              </div>
            )}

            <button 
              onClick={calculateFee}
              style={{ width: "100%", padding: "16px", background: "var(--forest)", color: "var(--gold-pale)", border: "none", borderRadius: 12, fontFamily: "'Instrument Sans',sans-serif", fontSize: 16, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", boxShadow: "0 4px 12px rgba(26,46,26,0.2)" }}
            >
              Calculate Fee
            </button>
          </div>

          <div style={{ background: "var(--forest)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: "48px clamp(20px, 4vw, 32px)", color: "var(--ivory)", textAlign: "center", position: "relative", overflow: "hidden", minHeight: 380, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ position: "absolute", top: -80, right: -80, width: 250, height: 250, borderRadius: "50%", background: "var(--gold)", opacity: 0.1, filter: "blur(40px)" }} />
            
            {fee === null ? (
              <div>
                <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>⚖️</div>
                <div style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, maxWidth: 300, margin: "0 auto" }}>Enter the jurisdiction and suit parameters to determine the court fee.</div>
              </div>
            ) : (
              <div style={{ zIndex: 1 }}>
                <div style={{ display: "inline-flex", background: "rgba(201,146,10,0.15)", color: "var(--gold)", padding: "4px 12px", borderRadius: 12, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 16 }}>
                  {fee.isFixed ? "Fixed Schedule Fee" : "Ad-Valorem Duty"}
                </div>
                
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(48px, 6vw, 64px)", fontWeight: 300, color: "var(--ivory)", lineHeight: 1, marginBottom: 32 }}>
                  ₹{Math.round(fee.total).toLocaleString('en-IN')}
                </div>
                
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", textAlign: "left", lineHeight: 1.6 }}>
                    <strong>Breakdown:</strong> {fee.breakdown}
                  </div>
                </div>
                
                <div style={{ marginTop: 24, padding: "12px", background: "rgba(255,255,255,0.05)", borderRadius: 8, fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, textAlign: "left" }}>
                  ⚠️ Note: This relies upon approximated statutory slabs for reference purposes only. Always consult the official court registry or specific State amendments (e.g. Bombay Court Fees Act, 1959) prior to finalizing submissions.
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
