# Nyay Mitra — AI Legal Aid for Every Indian
> *न्याय आपकी भाषा में — हर नागरिक के लिए*

India's most comprehensive AI legal platform — serving rural citizens while empowering lawyers with intelligent tools.

---

## System Architecture

### Backend (Node.js / Express / TypeScript)
- **`server/routes.ts`** — Core API layer: AI chat completions, legal case matching engine (ported from Python), session management, JWT auth
- **`server/db.ts`** — SQLite database via Drizzle ORM: users, sessions, messages, legal_cases, legal_laws, legal_sections, legal_principles (10 SC cases, 5 laws, 10+ sections seeded)
- **`server/index.ts`** — Express server with Vite SSR middleware in dev mode

### AI Engine
- **Sarvam AI (`sarvam-30b`)** — Primary model powering all legal Q&A, context-aware responses in English, Hindi & Marathi
- **Issue Classifier** — 10-category rule-based classifier (MVA_INJURY, FAMILY_DIVORCE, CRIME_THEFT, LABOUR_DISPUTE, RTI_VIOLATION, etc.) runs before every AI call
- **Case Matching Engine** — Scores and ranks Supreme Court / High Court precedents by relevance to the user query

### Frontend (React / Vite / TailwindCSS)
- **`ChatPage.tsx`** — AI Legal Chat with CaseCard + LawCard components, multilingual input, session history
- **`DocumentGeneratorPage.tsx`** — Auto-drafts legal notices, RTI applications, bail petitions
- **`NALSACheckerPage.tsx`** — Eligibility quiz for government-funded free legal aid
- **`UndertrialTrackerPage.tsx`** — §436A bail eligibility tracker for undertrial prisoners
- **`VakilSahayakPage.tsx`** — Lawyer portal: live case research, client management, cause list
- **`LandingPage.tsx`** — Bilingual hero (English + हिंदी), feature grid, dual CTA

### Database (SQLite + Drizzle ORM)
- `legal_cases` — 10 real Supreme Court / High Court cases with parties, year, court, judgment, outcome, legal principles
- `legal_laws` — IPC, CrPC, MVA, DV Act, NALSA Act with full-text and status
- `legal_sections` — 10+ key sections with plain-language explanations and penalties
- `legal_principles` — 10 foundational Indian legal principles with source cases

---

## Key Features

- 🤖 **AI Legal Chat** — Ask any legal question in plain language, get step-by-step guidance with cited laws and real case precedents
- 📄 **Document Generator** — Instant legal notices, RTI applications, consumer complaints, bail applications
- ⚖️ **NALSA Eligibility** — Checks if you qualify for completely free government legal aid
- 🔍 **Undertrial Tracker** — §436A default bail eligibility calculator for prisoners' families
- 👨‍⚖️ **Vakil Sahayak** — AI-powered case research + client management portal for lawyers
- 🌐 **Multilingual** — English, हिंदी, मराठी with language-aware AI responses
- 🌙 **Dark Mode** — Full dark/light theme toggle

---

## Built With

| Layer | Technology |
|---|---|
| Frontend | React, Vite, TailwindCSS, TypeScript |
| Backend | Node.js, Express, TypeScript |
| Database | SQLite, Drizzle ORM, better-sqlite3 |
| AI Model | Sarvam AI (`sarvam-30b`) |
| Auth | JWT, bcryptjs |
| Dev Tooling | tsx, Vite HMR |

---

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Add your SARVAM_API_KEY to .env

# Start development server (served on port 5000)
npm run dev
```

The app is served at `http://localhost:5000` — both the API and frontend on the same port.

---

## API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Server health + AI connection status |
| `/api/sessions` | GET/POST | Chat session management |
| `/api/sessions/:id/chat` | POST | Send message, get AI response |
| `/api/legal/chat` | POST | Legal Q&A with case + law matching |
| `/api/legal/search/cases` | GET | Full-text case search |
| `/api/legal/search/laws` | GET | Full-text law/section search |
| `/api/legal/cases/:id` | GET | Case detail by ID |

---

*Nyay Mitra provides general legal information. Always consult a qualified lawyer for your specific situation.*
