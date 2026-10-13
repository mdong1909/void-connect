# Live Q&A Workshop Files

This bundle contains the app checkpoints used by the workshop.

`working-repo` is the app folder attendees edit during the live session.

Each checkpoint is a complete fallback app folder. If you get stuck during the live session, move into the matching checkpoint and continue from there.

```txt
working-repo/
checkpoints/
  02-database/
  03-websockets/
  04-ai/
  05-auth/
  06-email/
```

Start with:

```bash
cd working-repo
node --version
npm --version
npx --version
npm install
npm run dev
```

Checkpoint status:

- `working-repo`: static app shell used throughout the workshop
- `02-database`: database-backed questions
- `03-websockets`: anonymous realtime question updates across tabs
- `04-ai`: AI sentiment classification on top of anonymous realtime questions
- `05-auth`: email/password auth, question authors, realtime, and AI sentiment
- `06-email`: optional email notification when a question is posted

## Install Troubleshooting

If `npm install` fails while downloading an `@cloudflare/*` package, check whether your machine has a custom scoped registry:

```bash
npm config get @cloudflare:registry
```

Ask the workshop helper which registry should be used for the session.

