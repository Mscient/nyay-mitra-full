import { createContext, useContext, useState, type ReactNode } from "react";

export type Language = "en" | "hi" | "mr";

export const LANGUAGES: Record<Language, { label: string; nativeLabel: string; flag: string }> = {
  en: { label: "English", nativeLabel: "English", flag: "🇬🇧" },
  hi: { label: "Hindi", nativeLabel: "हिंदी", flag: "🇮🇳" },
  mr: { label: "Marathi", nativeLabel: "मराठी", flag: "🇮🇳" },
};

export const UI_STRINGS: Record<Language, Record<string, string>> = {
  en: {
    appName: "Nyay Mitra",
    tagline: "Your AI Legal Aid Assistant",
    heroTitle: "Know Your Rights.",
    heroSubtitle: "Free legal guidance powered by AI — available in English, Hindi, and Marathi.",
    startChat: "Start Free Consultation",
    login: "Login",
    register: "Register",
    logout: "Logout",
    newSession: "New Consultation",
    categories: "Legal Categories",
    typeMessage: "Type your legal question…",
    sendMessage: "Send",
    welcome: "Welcome to Nyay Mitra",
    welcomeDesc: "Ask any question about your legal rights in India. Select a category or type your question below.",
    disclaimer: "Nyay Mitra provides general legal information, not legal advice. Always consult a qualified lawyer for your specific case.",
    emergencyTitle: "Emergency Helplines",
    loginTitle: "Welcome Back",
    loginSubtitle: "Sign in to save your consultations",
    registerTitle: "Create Account",
    registerSubtitle: "Get free legal guidance in your language",
    name: "Full Name",
    email: "Email Address",
    password: "Password",
    language: "Preferred Language",
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?",
    continueAsGuest: "Continue as Guest",
    myConsultations: "My Consultations",
    bookmarks: "Saved Responses",
    deleteSession: "Delete",
    copyResponse: "Copy",
    bookmarkResponse: "Save",
    sessionHistory: "Past Consultations",
    noSessions: "No consultations yet",
    noSessionsDesc: "Start a new consultation to get legal guidance",
    thinking: "Nyay Mitra is thinking…",
    errorTitle: "Something went wrong",
    errorRetry: "Try again",
  },
  hi: {
    appName: "न्याय मित्र",
    tagline: "आपका AI कानूनी सहायक",
    heroTitle: "अपने अधिकार जानें।",
    heroSubtitle: "AI द्वारा संचालित मुफ्त कानूनी मार्गदर्शन — हिंदी, अंग्रेजी और मराठी में उपलब्ध।",
    startChat: "मुफ्त परामर्श शुरू करें",
    login: "लॉग इन",
    register: "पंजीकरण",
    logout: "लॉग आउट",
    newSession: "नया परामर्श",
    categories: "कानूनी श्रेणियाँ",
    typeMessage: "अपना कानूनी प्रश्न टाइप करें…",
    sendMessage: "भेजें",
    welcome: "न्याय मित्र में आपका स्वागत है",
    welcomeDesc: "भारत में अपने कानूनी अधिकारों के बारे में कोई भी प्रश्न पूछें।",
    disclaimer: "न्याय मित्र सामान्य कानूनी जानकारी प्रदान करता है, कानूनी सलाह नहीं। अपने विशिष्ट मामले के लिए हमेशा योग्य वकील से परामर्श करें।",
    emergencyTitle: "आपातकालीन हेल्पलाइन",
    loginTitle: "वापसी पर स्वागत है",
    loginSubtitle: "अपने परामर्श सहेजने के लिए साइन इन करें",
    registerTitle: "खाता बनाएं",
    registerSubtitle: "अपनी भाषा में मुफ्त कानूनी मार्गदर्शन पाएं",
    name: "पूरा नाम",
    email: "ईमेल पता",
    password: "पासवर्ड",
    language: "पसंदीदा भाषा",
    alreadyHaveAccount: "पहले से खाता है?",
    dontHaveAccount: "खाता नहीं है?",
    continueAsGuest: "अतिथि के रूप में जारी रखें",
    myConsultations: "मेरे परामर्श",
    bookmarks: "सहेजे गए उत्तर",
    deleteSession: "हटाएं",
    copyResponse: "कॉपी करें",
    bookmarkResponse: "सहेजें",
    sessionHistory: "पिछले परामर्श",
    noSessions: "अभी तक कोई परामर्श नहीं",
    noSessionsDesc: "कानूनी मार्गदर्शन के लिए नया परामर्श शुरू करें",
    thinking: "न्याय मित्र सोच रहा है…",
    errorTitle: "कुछ गलत हो गया",
    errorRetry: "पुनः प्रयास करें",
  },
  mr: {
    appName: "न्याय मित्र",
    tagline: "तुमचा AI कायदेशीर सहाय्यक",
    heroTitle: "तुमचे हक्क जाणा.",
    heroSubtitle: "AI द्वारे मोफत कायदेशीर मार्गदर्शन — मराठी, हिंदी आणि इंग्रजीत उपलब्ध.",
    startChat: "मोफत सल्ला सुरू करा",
    login: "लॉगिन",
    register: "नोंदणी",
    logout: "लॉग आउट",
    newSession: "नवीन सल्ला",
    categories: "कायदेशीर श्रेण्या",
    typeMessage: "तुमचा कायदेशीर प्रश्न टाइप करा…",
    sendMessage: "पाठवा",
    welcome: "न्याय मित्रमध्ये स्वागत आहे",
    welcomeDesc: "भारतातील तुमच्या कायदेशीर हक्कांबद्दल कोणताही प्रश्न विचारा.",
    disclaimer: "न्याय मित्र सामान्य कायदेशीर माहिती पुरवतो, कायदेशीर सल्ला नाही. तुमच्या विशिष्ट प्रकरणासाठी नेहमी पात्र वकिलाचा सल्ला घ्या.",
    emergencyTitle: "आणीबाणी हेल्पलाइन",
    loginTitle: "परत स्वागत आहे",
    loginSubtitle: "तुमचे सल्ले जतन करण्यासाठी साइन इन करा",
    registerTitle: "खाते तयार करा",
    registerSubtitle: "तुमच्या भाषेत मोफत कायदेशीर मार्गदर्शन मिळवा",
    name: "पूर्ण नाव",
    email: "ईमेल पत्ता",
    password: "पासवर्ड",
    language: "पसंतीची भाषा",
    alreadyHaveAccount: "आधीपासून खाते आहे?",
    dontHaveAccount: "खाते नाही?",
    continueAsGuest: "पाहुणे म्हणून सुरू ठेवा",
    myConsultations: "माझे सल्ले",
    bookmarks: "जतन केलेले प्रतिसाद",
    deleteSession: "हटवा",
    copyResponse: "कॉपी करा",
    bookmarkResponse: "जतन करा",
    sessionHistory: "मागील सल्ले",
    noSessions: "अद्याप कोणतेही सल्ले नाहीत",
    noSessionsDesc: "कायदेशीर मार्गदर्शनासाठी नवीन सल्ला सुरू करा",
    thinking: "न्याय मित्र विचार करत आहे…",
    errorTitle: "काहीतरी चुकले",
    errorRetry: "पुन्हा प्रयत्न करा",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children, initialLang = "en" }: { children: ReactNode; initialLang?: Language }) {
  const [language, setLanguage] = useState<Language>(initialLang);

  function t(key: string): string {
    return UI_STRINGS[language][key] || UI_STRINGS.en[key] || key;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
