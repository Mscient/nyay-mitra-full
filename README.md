# Nyay Mitra (न्याय मित्र) — AI Legal Aid Chatbot

A full-stack AI-powered legal aid assistant for Indian citizens. Available in English, Hindi, and Marathi.

## Tech Stack
- **Backend:** Node.js + Express + SQLite (better-sqlite3 + Drizzle ORM)
- **Frontend:** React + Vite + Tailwind CSS + shadcn/ui
- **Auth:** JWT (jsonwebtoken + bcryptjs)
- **AI:** OpenAI GPT-4o-mini (optional — falls back to demo responses)

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set environment variables (optional)
Create a `.env` file in the root:
```
OPENAI_API_KEY=sk-your-key-here
JWT_SECRET=your-secret-key-here
PORT=5000
```
Without `OPENAI_API_KEY`, the app uses built-in demo responses covering all major Indian legal topics.

### 3. Run in development
```bash
npm run dev
```
Open http://localhost:5000

### 4. Build for production
```bash
npm run build
NODE_ENV=production node dist/index.cjs
```

## Features
- **User accounts** — register/login with JWT auth, bcrypt hashed passwords
- **3 languages** — English, Hindi (हिंदी), Marathi (मराठी)
- **9 legal categories** — Criminal, Family, Labour, Consumer, Property, RTI, Constitutional, Women's Rights, General
- **Real AI responses** — GPT-4o-mini with Indian law system prompt
- **Session history** — all consultations saved to SQLite
- **Dark/light mode** — system preference + manual toggle
- **Mobile-first** — responsive sidebar, touch-friendly

## API Endpoints
- `POST /api/auth/register` — create account
- `POST /api/auth/login` — get JWT token
- `GET /api/auth/me` — get current user (auth required)
- `PATCH /api/auth/language` — update preferred language
- `GET /api/sessions` — list sessions
- `POST /api/sessions` — create session
- `POST /api/sessions/:id/chat` — send message, get AI response
- `GET /api/health` — health check

## Database
SQLite database auto-created at `data/nyay-mitra.db` on first run.
Tables: users, sessions, messages, bookmarks

## Emergency Helplines (built into responses)
- Emergency: 112
- Women Helpline: 181
- NALSA Legal Aid: 15100
- Consumer Helpline: 1800-11-4000
- Child Helpline: 1098

## Built with
Perplexity Computer — https://www.perplexity.ai/computer
