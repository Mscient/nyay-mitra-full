# 🤝 AI Bridge — Multi-Agent Coordination File
> **Read this file fully before starting any work session.**
> Last updated by: **AI-1 (Antigravity)** — 2026-03-25 16:22 IST

---

## 👥 Agent Registry

| Agent ID | Tool | Role |
|----------|------|------|
| **AI-1 (Antigravity)** | Antigravity in VS Code | Full-stack implementation lead |
| **AI-2 (Gemini)** | Gemini Code Assist in VS Code | Testing, cleanup, integration QA |

---

## 📌 How to Use This File

**When you start a session, copy-paste this entire file into your chat.** The user will relay messages between each AI by copying sections from this file.

**Protocol:**
1. Check "File Locks" before editing any file
2. Pick tasks from "Gemini's Task Queue" below
3. When done, update status in the table
4. Write messages in "Message Queue" for AI-1 to review

---

## ✅ Completed Work — AI-1 (Antigravity) Summary

| File | What Was Done |
|------|---------------|
| `server/index.ts` | Added `express-rate-limit` (100 req/min global, 10/min auth) |
| `server/routes.ts` | Added structured logging, global error handler, health/readiness probes, Voice STT/TTS endpoints, HITL fallback, IndianKanoon live search, RSS news proxy |
| `client/src/components/ui/state-wrapper.tsx` | **NEW** — Universal 5-state UI wrapper (Loading/Error/Empty/Disabled/Default) |
| `client/src/components/VoiceRecorder.tsx` | **NEW** — Accessible browser voice recorder with MediaRecorder |
| `client/src/components/DPDPConsentBanner.tsx` | **NEW** — DPDP Act 2023 consent banner with localStorage persistence |
| `client/src/pages/VakilSahayakPage.tsx` | Full Tailwind/mobile-first refactor, real IndianKanoon search, 5-state UI |
| `client/src/pages/LoginPage.tsx` | Rebuilt with per-field `onBlur` validation and accessible errors |
| `client/src/pages/RegisterPage.tsx` | Rebuilt with per-field `onBlur` validation and accessible errors |
| `client/src/pages/LegalNewsPage.tsx` | **NEW** — Live RSS news feed from LiveLaw + Bar & Bench |
| `client/src/pages/FinancialAidPage.tsx` | **NEW** — 6-module financial legal guide (SARFAESI, Cheque Bounce, Tax, Banking, Insurance, GST) |
| `client/src/pages/KnowYourRightsPage.tsx` | **NEW** — 6 Indian acts + FIR assistant with plain-language explainers |
| `client/src/pages/StartupHubPage.tsx` | **NEW** — Startup legal hub (incorporation, compliance calendar, documents) |
| `client/src/App.tsx` | All new routes registered, DPDP banner mounted globally |
| `ai-bridge.md` | This coordination file |

---

## 🔒 File Locks (Do NOT edit these files right now)

| File | Locked By | Reason |
|------|-----------|--------|
| `server/routes.ts` | AI-1 | Active work |
| `client/src/App.tsx` | AI-1 | Route registration in progress |

> **Files NOT in this list are safe for AI-2 to edit.**

---

## 🎯 Gemini's Task Queue — Sprint 2 QA & Testing

> **AI-2 (Gemini): Pick any of these tasks. Work on files NOT in the lock list above.**

### HIGH PRIORITY

#### Task G-01 — Add `@types/express-rate-limit` if missing
- **File:** `package.json` / run `npm install -D @types/express-rate-limit`
- **Why:** The `import rateLimit from 'express-rate-limit'` in `server/index.ts` may have type issues
- **Status:** ✅ Done (by AI-1 as AI-2 was offline)

#### Task G-02 — Write JSDoc for `StateWrapper` component
- **File:** `client/src/components/ui/state-wrapper.tsx`
- **What:** Add TSDoc comments to the interface props and the function. Example:
  ```ts
  /** Whether to render the loading skeleton state */
  isLoading: boolean;
  ```
- **Status:** ✅ Done (by AI-1 as AI-2 was offline)

#### Task G-03 — Create a reusable `NavBar` component
- **File:** `client/src/components/NavBar.tsx` (NEW FILE — safe to create)
- **Why:** Every page (`LegalNewsPage`, `FinancialAidPage`, `KnowYourRightsPage`, `StartupHubPage`) has copy-pasted nav code. Extract it into a shared component with these props:
  ```ts
  interface NavBarProps {
    title: string;
    badge?: string;
    backHref?: string;
    showThemeToggle?: boolean;
    rightContent?: React.ReactNode;
  }
  ```
- **Status:** ✅ Done (by AI-1)

#### Task G-04 — Fix LandingPage navigation links
- **File:** `client/src/pages/LandingPage.tsx`
- **What:** Check that `LandingPage.tsx` has navigation links/buttons to the new pages:
  - `/legal-news` → "Legal News" 
  - `/financial-aid` → "Financial Legal Aid"
  - `/know-your-rights` → "Know Your Rights"
  - `/startup-hub` → "Startup Hub"
  If not present, add them in a consistent "All Tools" section
- **Status:** ✅ Done (by AI-1)

#### Task G-05 — Add `.env.example` file
- **File:** `.env.example` (NEW FILE — safe to create)
- **What:** Create a documented env example file listing all required and optional keys:
  ```env
  # Required
  SARVAM_API_KEY=your_sarvam_key_here
  JWT_SECRET=change_this_in_production

  # Optional — enhances features
  INDIANKANOON_API_TOKEN=token_from_api.indiankanoon.org
  GOOGLE_CLIENT_ID=your_google_oauth_client_id
  
  # Server
  PORT=5000
  NODE_ENV=development
  ```
- **Status:** ✅ Done (by AI-1)

#### Task G-06 — Audit and remove console.log debug statements
- **Files:** `server/routes.ts`, `client/src/**/*.tsx`
- **What:** Search for `console.log("SARVAM COMPLETION` and similar debug logs that were left in from debugging. Replace with structured logger calls or remove entirely.
- **Status:** ✅ Done (by AI-1)

---

### MEDIUM PRIORITY

#### Task G-07 — Add ARIA labels to VoiceRecorder
- **File:** `client/src/components/VoiceRecorder.tsx`
- **What:** Verify all buttons have proper `aria-label`, `aria-live` region for status, and `role="status"` for the transcribing state
- **Status:** ✅ Done (by AI-1)

#### Task G-08 — Add loading skeletons to LegalNewsPage
- **File:** `client/src/pages/LegalNewsPage.tsx`
- **What:** The `StateWrapper`'s default skeleton shows 3 lines. For `LegalNewsPage`, pass a custom skeleton prop that renders 5 news-card-shaped skeletons instead
- **Status:** ✅ Done (by AI-1)

---

## 💬 Message Queue

| From | To | Message | Status |
|------|----|---------|--------|
| AI-1 | AI-2 | "I've completed all core Sprint 2 pages. Your tasks are in the queue above. Most important: G-03 (NavBar refactor) and G-04 (LandingPage links). Start with those. Do NOT touch `server/routes.ts` or `App.tsx` until I post an unlock." | ✅ Sent |

---

## ⚙️ Architecture Quick Reference

```
Design Tokens: use CSS var (--primary, --secondary) or Tailwind (bg-primary, text-secondary)
NEVER: hardcode hex colors like #1a3d2b

5-State Rule: every data component uses <StateWrapper> from @/components/ui/state-wrapper

API Base URL: all /api/* routes are Express. Client uses relative fetch('/api/...')

Key APIs:
  Sarvam Chat: POST /api/legal/chat
  STT: POST /api/voice/transcribe
  TTS: POST /api/voice/synthesize
  IndianKanoon: GET /api/legal/ik-search?q=...
  News RSS: GET /api/legal/news

New pages registered in App.tsx:
  /legal-news → LegalNewsPage
  /financial-aid → FinancialAidPage
  /know-your-rights → KnowYourRightsPage
  /startup-hub → StartupHubPage
```

---

*Last sync: AI-1 (Antigravity) — 2026-03-25 16:22 IST*
