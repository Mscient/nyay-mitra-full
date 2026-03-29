import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Toaster } from "@/components/ui/toaster";
import { DPDPConsentBanner } from "@/components/DPDPConsentBanner";
import LandingPage from "@/pages/LandingPage";
import ChatPage from "@/pages/ChatPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DocumentGeneratorPage from "@/pages/DocumentGeneratorPage";
import NALSACheckerPage from "@/pages/NALSACheckerPage";
import UndertrialTrackerPage from "@/pages/UndertrialTrackerPage";
import VakilSahayakPage from "@/pages/VakilSahayakPage";
import LegalNewsPage from "@/pages/LegalNewsPage";
import FinancialAidPage from "@/pages/FinancialAidPage";
import KnowYourRightsPage from "@/pages/KnowYourRightsPage";
import StartupHubPage from "@/pages/StartupHubPage";
import CourtFeeCalculatorPage from "@/pages/CourtFeeCalculatorPage";
import CaseStatusPage from "@/pages/CaseStatusPage";
import NotFound from "@/pages/not-found";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <Router hook={useHashLocation}>
              <Switch>
                <Route path="/" component={LandingPage} />
                <Route path="/chat" component={ChatPage} />
                <Route path="/chat/:sessionId" component={ChatPage} />
                <Route path="/login" component={LoginPage} />
                <Route path="/register" component={RegisterPage} />
                <Route path="/documents" component={DocumentGeneratorPage} />
                <Route path="/nalsa-check" component={NALSACheckerPage} />
                <Route path="/undertrial-tracker" component={UndertrialTrackerPage} />
                <Route path="/vakil-sahayak" component={VakilSahayakPage} />
                <Route path="/legal-news" component={LegalNewsPage} />
                <Route path="/financial-aid" component={FinancialAidPage} />
                <Route path="/know-your-rights" component={KnowYourRightsPage} />
                <Route path="/startup-hub" component={StartupHubPage} />
                <Route path="/court-fee-calculator" component={CourtFeeCalculatorPage} />
                <Route path="/case-status" component={CaseStatusPage} />
                <Route component={NotFound} />
              </Switch>
            </Router>
            <Toaster />
            <DPDPConsentBanner />
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
