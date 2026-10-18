# Checkpoint 01: Static Starter

This checkpoint is the static starter for the Live Q&A app.

Submitted questions are stored only in browser memory. Refresh the page and they disappear. Lesson 02 adds a database so questions persist.

## Set up this checkpoint

Install dependencies:

```bash
npm install
```

This static starter has no database, so no database command is needed.

## Initial deployment: choose a project name

Connect to the workshop platform:

```bash
npx void connect https://api.mdong.fyi --no-login
```

Replace `your-name` in `live-qa-your-name-01` with your own name and choose an unused project name for this checkpoint. The first deployment creates that project and links this folder to it.

**macOS / Linux:**

```bash
VOID_API_URL=https://api.mdong.fyi VOID_TOKEN=void-anonymous-deploy npx void deploy --platform void --project live-qa-your-name-01
```

**Windows PowerShell:**

```powershell
$env:VOID_API_URL="https://api.mdong.fyi"; $env:VOID_TOKEN="void-anonymous-deploy"; npx void deploy --platform void --project live-qa-your-name-01
```

**Windows Command Prompt:**

```bat
set "VOID_API_URL=https://api.mdong.fyi" && set "VOID_TOKEN=void-anonymous-deploy" && npx void deploy --platform void --project live-qa-your-name-01
```

Keep using this folder and project for subsequent edits. Later deployments from this linked folder can omit `--project`. If you switch to another checkpoint folder, give it a new project name: checkpoints are standalone snapshots with their own migration histories.

## Run Locally

```bash
npm run dev
```
