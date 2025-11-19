# SimTrainer

SimTrainer is an interactive practice lab for Resident Assistants (RAs) and Teaching Assistants (TAs). Trainees chat with an AI‑driven student persona, receive real‑time scores for empathy/curiosity/structure/satisfaction, and save conversations for reflection. Everything runs locally with [Next.js](https://nextjs.org), [Prisma](https://www.prisma.io/), and [Ollama](https://ollama.com/) so recruiters and collaborators can inspect the full stack.

## Highlights

- **Real RA/TA scenarios** – 20+ prebuilt tracks plus support for custom prompts.
- **Local LLM feedback** – the `/api/evaluate` route uses Ollama to score the entire conversation and determine whether the student feels satisfied.
- **Conversation history** – authenticated users can save, reopen, and reset runs with full transcripts and rubric metrics.
- **Customizable UI** – reusable `ChatPanel`, history dashboard, and builder pages to tweak personas without redeploying.

## Tech Stack

| Layer            | Tech                                                                  |
| ---------------- | --------------------------------------------------------------------- |
| Frontend         | Next.js App Router, Tailwind CSS, TypeScript                          |
| Backend          | Next.js API routes (`/api/chat`, `/api/evaluate`, `/api/history`)     |
| Database         | SQLite via Prisma ORM                                                 |
| Authentication   | NextAuth.js (credentials provider)                                    |
| AI Integration   | Local Ollama models (default `llama3`) for conversation + evaluation  |

## Prerequisites

1. **Node.js 18+** (recommend `nvm use 18`).
2. **npm** (ships with Node) or `pnpm`/`yarn`/`bun` if you prefer.
3. **Ollama**:
   - Download from [ollama.com/download](https://ollama.com/download).
   - Install and start the Ollama service.
   - Pull the conversational model: `ollama pull llama3` (or your chosen model).
4. **SQLite** (bundled with Prisma; no separate install needed).

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/your-org/simtrainer.git
cd simtrainer

# 2. Install dependencies
npm install

# 3. Copy environment template and set secrets
cp .env.example .env.local
# Fill in NEXTAUTH_SECRET, DATABASE_URL, SMTP creds (optional), etc.

# 4. Generate Prisma client & migrate
npx prisma migrate dev

# 5. Ensure Ollama is running
ollama serve  # (Mac/Linux) or launch the Ollama desktop app on Windows

# 6. Start the dev server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to explore scenarios. The default RA/TA chat loads a scripted student opener; use the right sidebar to switch tracks or custom prompts.

## Configuring Ollama

- The app points to `http://127.0.0.1:11434` by default. Override via `.env.local`:

  ```bash
  OLLAMA_URL=http://localhost:11434
  OLLAMA_MODEL=llama3.1:8b  # any installed model
  ```

- `/api/chat` streams student responses, while `/api/evaluate` sends the entire transcript to Ollama to receive JSON feedback with empathy/curiosity/structure/satisfaction/resolved/summary.

## Project Structure

```
simtrainer/
├─ app/
│  ├─ api/               # REST endpoints (chat, evaluate, auth, history)
│  ├─ auth/, history/…   # Pages rendered via App Router
│  └─ scenarios/         # Prebuilt RA/TA prompts
├─ components/           # ChatPanel, HistoryList, Scenario builders
├─ data/tracks.ts        # Scenario metadata
├─ prisma/
│  └─ schema.prisma      # Conversation + user models
├─ lib/                  # Prisma client, auth helpers, session storage
└─ README.md
```

## Running in Production

```bash
npm run build
npm run start
```

Set `NODE_ENV=production`, ensure `DATABASE_URL` points to a persistent SQLite/ Postgres instance, and keep Ollama running on the same network location as defined in your env vars. Deployments to platforms like Vercel require a reachable Ollama endpoint (self-hosted VM or container).

## Custom Scenarios

1. Navigate to `/builder` to author a new prompt.
2. Provide a title, short description, and persona notes.
3. Save the generated slug in your database or run it ad hoc.

Alternatively, add entries directly to `data/tracks.ts` and redeploy.

## Testing the Evaluation Flow

- Start a sample conversation in `/ra` or `/ta`.
- Click **End scenario & save** to trigger `/api/evaluate`.
- Watch the numeric scores and “Scenario complete” banner appear when the student is satisfied.

## Troubleshooting

| Issue                                  | Fix                                                                 |
| -------------------------------------- | -------------------------------------------------------------------- |
| `fetch ECONNREFUSED 127.0.0.1:11434`   | Ensure Ollama is running and reachable; verify `OLLAMA_URL`.        |
| Feedback JSON parsing error            | Check Ollama logs; confirm the model supports JSON-style responses. |
| Prisma migration fails                 | Delete `prisma/dev.db` (if safe) and rerun `npx prisma migrate dev`. |
| “Unauthorized” on history pages        | Create an account via `/auth/register`, then log in.                |

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feat/new-scenario`.
3. Commit changes with clear messages.
4. Open a PR describing the scenario/feature and attach screenshots or Looms of the new interaction.

## License

MIT © SimTrainer Team. Feel free to adapt for your own RA/TA coaching needs—just share improvements! 
