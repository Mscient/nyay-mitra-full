import { useState } from "react";
import { Link } from "wouter";
import { NavBar } from "@/components/NavBar";
import { StateWrapper } from "@/components/ui/state-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calculator, ArrowRight, ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CourtFeeCalculatorPage() {
  const [state, setState] = useState("maharashtra");
  const [suitValue, setSuitValue] = useState("");
  const [fee, setFee] = useState<number | null>(null);
  
  const calculateFee = () => {
    const value = parseFloat(suitValue);
    if (isNaN(value) || value <= 0) return setFee(0);
    
    // Abstract ad-valorem calculations (approximated for demo)
    let calculated = 0;
    if (state === "maharashtra") {
      calculated = value * 0.02; 
      if (calculated > 300000) calculated = 300000; // max fee cap
    } else if (state === "delhi") {
      calculated = value * 0.015;
    } else if (state === "karnataka") {
      calculated = value * 0.025;
    } else {
      calculated = value * 0.02; // generic fallback
    }
    
    // Add base filing fee
    setFee(calculated + 500);
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <NavBar title="Court Fee Calculator" />
      
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-16">
        <Link href="/vakil-sahayak">
          <Button variant="ghost" className="mb-6 -ml-4 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Vakil Sahayak
          </Button>
        </Link>
        
        <div className="mb-8">
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
            Court Fee <span className="text-secondary italic">Calculator</span>
          </h1>
          <p className="t-body text-muted-foreground max-w-2xl">
            Quickly estimate ad-valorem court fees for civil suits based on state jurisdictions and overall suit valuation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Panel */}
          <Card className="border-secondary/20 shadow-sm">
            <CardHeader className="bg-secondary/5 rounded-t-xl border-b border-border/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="h-5 w-5 text-secondary" /> Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Jurisdiction (State)</label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger className="w-full text-base h-12 rounded-xl">
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maharashtra">Maharashtra</SelectItem>
                    <SelectItem value="delhi">Delhi</SelectItem>
                    <SelectItem value="karnataka">Karnataka</SelectItem>
                    <SelectItem value="other">Other States (Generic Formula)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Suit Valuation (INR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-muted-foreground">₹</span>
                  <Input 
                    type="number" 
                    value={suitValue} 
                    onChange={(e) => setSuitValue(e.target.value)}
                    placeholder="e.g. 500000"
                    className="pl-8 h-12 text-lg rounded-xl"
                  />
                </div>
              </div>

              <Button 
                onClick={calculateFee} 
                className="w-full h-12 text-base rounded-xl bg-forest hover:bg-forest/90 text-ivory"
              >
                Calculate Ad-Valorem Fee <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <StateWrapper 
            isLoading={false}
            isError={false}
            isEmpty={fee === null} 
            emptyMessage="Enter the parameters on the left and click calculate."
          >
            {fee !== null && (
              <Card className="bg-primary text-primary-foreground shadow-xl border-none relative overflow-hidden flex flex-col justify-center min-h-[300px]">
                {/* Decorative circle */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-secondary/10 blur-3xl mix-blend-screen pointer-events-none" />
                
                <CardContent className="relative z-10 text-center space-y-4 p-8">
                  <p className="text-primary-foreground/70 uppercase tracking-widest text-xs font-bold">Estimated Stamp Duty</p>
                  <div className="font-display text-5xl md:text-6xl font-light text-secondary">
                    ₹{Math.round(fee).toLocaleString('en-IN')}
                  </div>
                  <div className="pt-6 border-t border-primary-foreground/10 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-primary-foreground/60">Base Filing</span>
                      <span>₹500</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-primary-foreground/60">Ad-Valorem Duty</span>
                      <span>₹{Math.round(fee - 500).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </StateWrapper>
        </div>
      </main>
    </div>
  );
}
