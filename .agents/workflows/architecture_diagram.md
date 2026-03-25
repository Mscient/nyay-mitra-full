---
description: Generate System Architecture Diagram
---

This workflow analyzes the Nyay Mitra codebase and generates a comprehensive Mermaid system architecture diagram.

1. Read the `ai-bridge.md` and `client/src/App.tsx` files to understand the core features, components, and routes of the Nyay Mitra platform.
2. Scan `server/index.ts` and `server/routes.ts` to map out the backend Express API endpoints (Voice, News, Legal Search) and their external integrations (Sarvam AI, IndianKanoon, RSS Feeds).
3. Generate a `mermaid` markdown block containing a C4 Container diagram or a system architecture flowchart that visualizes:
   - The React Frontend (Landing, Citizen tools, Lawyer tools)
   - The Express Backend (Rate limiting, auth, proxy routes)
   - SQLite Database layer
   - 3rd Party APIs (AWS, Sarvam STT/TTS, IndianKanoon, LiveLaw/Bar&Bench)
4. Save the resulting Mermaid diagram to a file named `ARCHITECTURE.md` in the project root.
