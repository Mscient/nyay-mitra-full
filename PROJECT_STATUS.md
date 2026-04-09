# Nyay Mitra — Project Status & Handoff Document

> **Last Updated:** 2026-03-31 06:50 IST  
> **Purpose:** Any developer or AI coding assistant should be able to read this file and resume work immediately without needing prior context.

---

## 🏗️ What Is This Project?

**Nyay Mitra** is a full-stack AI Legal Operating System for India built as a **Turborepo monorepo**. It serves two audiences:
- **Citizens** — Get free legal aid guidance in 22 Indian languages via AI chat, voice, and WhatsApp
- **Advocates** — Case law research, client CRM, document drafting, hearing diary

**Core tech stack:** Next.js 14 (App Router) · Node.js microservices · PostgreSQL (Drizzle ORM) · Sarvam AI · Turborepo

---

## 🚀 How to Run the Application

### Minimum Setup (Frontend Only — works without database)

```powershell
# Step 1: Install all dependencies (from monorepo root)
cd c:\Users\prash\Downloads\nyay-mitra-complete\nyay-mitra-full
npm install

# Step 2: Start the Next.js frontend
cd apps/web
npm run dev
# Opens at → http://localhost:3000
```

**What works without any extra services:**
- ✅ All 14 pages (landing, chat, documents, NALSA check, case status, know-your-rights, financial-aid, startup-hub, undertrial tracker, court fee calculator, legal news, login, register, vakil-sahayak)
- ✅ Court fee calculator (pure frontend)
- ✅ Case law search (mock data — 25 landmark SC judgments across all major legal topics)
- ✅ Document generator (template mode, no AI key needed)
- ✅ Undertrial tracker / Section 436A calculator

### Full Setup (All Features)

```powershell
# Terminal 1 — Next.js Frontend
cd apps/web && npm run dev          # → http://localhost:3000

# Terminal 2 — Auth Service (optional for login/register)
cd apps/identity-svc && npm run dev  # → http://localhost:4001

# Terminal 3 — CRM Service (optional for Vakil Sahayak CRM)
cd apps/workspace-svc && npm run dev # → http://localhost:4002

# Terminal 4 — PDF Generation Service
cd apps/docgen-svc && npm run dev    # → http://localhost:4003
```

### Environment Variables

Create `apps/web/.env.local`:
```
SARVAM_API_KEY=your_sarvam_key_here        # For AI chat & document generation
WORKSPACE_SVC_URL=http://localhost:4002     # For Vakil Sahayak CRM (optional)
IDENTITY_SVC_URL=http://localhost:4001      # For login/register (optional)
DOCGEN_SVC_URL=http://localhost:4003        # For real PDF download (optional)
ECIAPI_TOKEN=your_ecourts_token_here        # For live CNR lookup (optional)
```

Create `apps/identity-svc/.env`:
```
DATABASE_URL=postgresql://user:password@host:5432/nyaymitra
JWT_SECRET=<random 64-char hex>
PORT=4001
```

Create `apps/workspace-svc/.env`:
```
DATABASE_URL=postgresql://user:password@host:5432/nyaymitra
PORT=4002
```

> **Without SARVAM_API_KEY**: Chat still works (returns mock disclaimer), Document Generator uses pre-built templates. All other features work normally.
> 
> **Without DATABASE_URL**: identity-svc and workspace-svc won't start. The frontend shows helpful "service offline" banners and gracefully degrades.
>
> **Without DOCGEN_SVC_URL / docgen-svc running**: Download button falls back to HTML download automatically. No user-facing error.

---

## 📁 Monorepo Structure

```
nyay-mitra-full/
├── apps/
│   ├── web/                   ← Next.js 14 frontend (PRIMARY — run this)
│   ├── legacy-vite/           ← Old Vite prototype (DO NOT MODIFY — reference only)
│   ├── identity-svc/          ← Auth microservice (Node/Express + JWT + OTP) port 4001
│   ├── workspace-svc/         ← Lawyer CRM microservice (Clients, Hearings, Matters) port 4002
│   ├── docgen-svc/            ← PDF generation microservice (Puppeteer) port 4003 ✅ COMPLETE
│   └── api-gateway/           ← (planned) Nginx or Express gateway
├── packages/
│   └── database/              ← Shared Drizzle ORM schema + migrations
├── .cursor/rules              ← AI coding guardrails (MUST READ before coding)
└── PROJECT_STATUS.md          ← This file
```

---

## ✅ Completed Work (100%)

### Phase 1 — Backend Microservices ✅ DONE

| Service | Port | Status | Notes |
|---|---|---|---|
| `packages/database` | — | ✅ Complete | Drizzle ORM schema: `users`, `tenants`, `clients`, `matters`, `hearings`, `invoices`. Row-level security by `tenant_id`. |
| `apps/identity-svc` | 4001 | ✅ Complete | JWT auth, OTP login, bcrypt (cost 12), refresh tokens, POST /v1/auth/login + /register |
| `apps/workspace-svc` | 4002 | ✅ Complete | Full CRUD for clients, matters, hearings, invoices. POST /hearings added. |
| `apps/docgen-svc` | 4003 | ✅ Complete | Puppeteer PDF generation. POST /v1/docgen/pdf + /v1/docgen/preview. Zod validation. |

### Phase 2 — Next.js Frontend Migration ✅ DONE

All pages successfully migrated from `apps/legacy-vite` → `apps/web` (Next.js 14 App Router).

**Font rule: NEVER CHANGE.** Font stack locked to `Cormorant Garamond` (display) + `Instrument Sans` (body) + `Noto Sans Devanagari` (Devanagari script).

#### All Pages Live ✅

| Route | File | Status |
|---|---|---|
| `/` | `apps/web/src/app/page.tsx` | ✅ Live — with 11-tool grid + portal cards |
| `/chat` | `apps/web/src/app/chat/page.tsx` | ✅ Live |
| `/court-fee-calculator` | `apps/web/src/app/court-fee-calculator/page.tsx` | ✅ Live |
| `/news` | `apps/web/src/app/news/page.tsx` | ✅ Live |
| `/vakil-sahayak` | `apps/web/src/app/vakil-sahayak/page.tsx` | ✅ Live — wired to workspace-svc via proxy |
| `/nalsa-check` | `apps/web/src/app/nalsa-check/page.tsx` | ✅ Live |
| `/case-status` | `apps/web/src/app/case-status/page.tsx` | ✅ Live |
| `/undertrial-tracker` | `apps/web/src/app/undertrial-tracker/page.tsx` | ✅ Live |
| `/login` | `apps/web/src/app/login/page.tsx` | ✅ Live — wired to identity-svc proxy |
| `/register` | `apps/web/src/app/register/page.tsx` | ✅ Live — wired to identity-svc proxy |
| `/know-your-rights` | `apps/web/src/app/know-your-rights/page.tsx` | ✅ Live |
| `/financial-aid` | `apps/web/src/app/financial-aid/page.tsx` | ✅ Live |
| `/startup-hub` | `apps/web/src/app/startup-hub/page.tsx` | ✅ Live |
| `/documents` | `apps/web/src/app/documents/page.tsx` | ✅ Live |

#### All API Routes Live ✅

| Route | File | Status |
|---|---|---|
| `POST /api/chat` | `apps/web/src/app/api/chat/route.ts` | ✅ Sarvam AI proxy + PII strip + rate limit |
| `POST /api/auth/login` | `apps/web/src/app/api/auth/login/route.ts` | ✅ Proxies to identity-svc |
| `POST /api/auth/register` | `apps/web/src/app/api/auth/register/route.ts` | ✅ Proxies to identity-svc |
| `GET /api/legal/news` | `apps/web/src/app/api/legal/news/route.ts` | ✅ RSS scraper LiveLaw + Bar&Bench |
| `GET /api/legal/ecourts/cnr/[cnr]` | `apps/web/src/app/api/legal/ecourts/cnr/[cnr]/route.ts` | ✅ eCourts proxy + mock fallback |
| `GET /api/legal/search/semantic` | `apps/web/src/app/api/legal/search/semantic/route.ts` | ✅ Keyword-scored dataset — **25 SC judgments** |
| `POST /api/documents/generate` | `apps/web/src/app/api/documents/generate/route.ts` | ✅ Sarvam AI template generation |
| `POST /api/documents/pdf` | `apps/web/src/app/api/documents/pdf/route.ts` | ✅ Proxies to docgen-svc, HTML fallback |
| `ALL /api/workspace/[...slug]` | `apps/web/src/app/api/workspace/[...slug]/route.ts` | ✅ Catch-all proxy to workspace-svc |

---

## 🔧 Current Behaviour Without Services

| Feature | No workspace-svc | No identity-svc | No SARVAM_API_KEY | No docgen-svc |
|---|---|---|---|---|
| Landing page | ✅ Works | ✅ Works | ✅ Works | ✅ Works |
| AI Chat | ✅ Works | ✅ Works | ⚠️ Returns mock disclaimer | ✅ Works |
| Case Search | ✅ Works (25 cases) | ✅ Works | ✅ Works | ✅ Works |
| Document Gen | ✅ Template mode | ✅ Works | ⚠️ Template mode | ✅ Works |
| Download PDF | ✅ HTML download | ✅ Works | ✅ Works | ⚠️ Falls back to HTML |
| Login/Register | ✅ Shows form | ⚠️ API returns 503 | ✅ Works | ✅ Works |
| Vakil CRM (clients/hearings) | ⚠️ Shows offline banner | ✅ Works | ✅ Works | ✅ Works |
| Know/Financial/Startup pages | ✅ Works | ✅ Works | ✅ Works | ✅ Works |
| Court Fee Calculator | ✅ Works | ✅ Works | ✅ Works | ✅ Works |

---

## 📋 Future Enhancements (Post-MVP Roadmap)

1. **Real semantic search** — Replace mock 25-case dataset with Elasticsearch or pgvector index over actual IndianKanoon corpus (~50k+ cases).
2. **Voice/WhatsApp agent** — Twilio + Sarvam AI integration for voice calls and WhatsApp (long-term roadmap).
3. **Database migrations** — Run `npx drizzle-kit push` once a real PostgreSQL instance is provisioned.
4. **API Gateway** — Wire `apps/api-gateway` (Nginx/Express) in front of all microservices for production.
5. **Analytics dashboard** — Usage metrics, hearing reminders via SMS/WhatsApp, court date alerts.

---

## 🚫 Rules (From `.cursor/rules` — MUST follow)

1. **Never hardcode API keys, passwords, or JWTs** — always use env vars
2. **Always parameterise SQL** — never concatenate user input
3. **Rate limit every new endpoint** — 100 req/min per IP minimum
4. **Strip PII before AI calls** — Aadhaar (12-digit), phone, email
5. **AI must never say** "you will win", "you have a strong case", "I advise you to"
6. **All new DB tables** need row-level security by `tenant_id`
7. **AES-256-GCM** for PII field encryption, **bcrypt cost 12** for passwords
8. **Never expose internal error details** in API responses
9. **Font stack is locked** — Cormorant Garamond + Instrument Sans + Noto Sans Devanagari. Do not change.
10. **`apps/legacy-vite`** is reference only — never modify it

---

## 📌 Design System

Key CSS variables in `apps/web/src/app/globals.css`:
```css
--forest: #1A2E1A        /* Primary dark green */
--gold: #C9920A          /* Primary gold */
--cream: #F9F5EE         /* Background */
--ivory: #FFFDF7         /* Card background */
--ink: #1C1C1E           /* Primary text */
--gold-pale: #F5DFA0     /* Light gold for dark bg text */
--ink-muted: #6B7280     /* Muted text */
--ink-mid: #374151        /* Mid text */
--border-color: #E8DFD0  /* Borders */
```

All pages: `fontFamily: "'Instrument Sans', sans-serif"` for body, `fontFamily: "'Cormorant Garamond', serif"` for headings.
