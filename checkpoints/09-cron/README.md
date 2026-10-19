# Checkpoint 09: Cron — Scheduled Email Summary

This final checkpoint emails a question summary to every registered app user every five minutes, using the email helper from Lesson 06 and the app from `08-queues`. It keeps authentication, realtime questions, Email Summary, and background AI classification with saved progress and retries.

Classification labels and confidence remain stored on each question. Results saved in Lesson 07 are preserved and are not queued again.

## Set up this checkpoint

Install dependencies:

```bash
npm install
```

Follow [Run Locally](#run-locally) below to prepare your local database before starting the app.

## Initial deployment: choose a project name

Connect to the workshop platform:

```bash
npx void connect https://api.mdong.fyi --no-login
```

Replace `your-name` in `live-qa-your-name-09` with your own name and choose an unused project name for this checkpoint. The first deployment creates that project and links this folder to it.

**macOS / Linux:**

```bash
VOID_API_URL=https://api.mdong.fyi VOID_TOKEN=void-anonymous-deploy npx void deploy --platform void --project live-qa-your-name-09
```

**Windows PowerShell:**

```powershell
$env:VOID_API_URL="https://api.mdong.fyi"; $env:VOID_TOKEN="void-anonymous-deploy"; npx void deploy --platform void --project live-qa-your-name-09
```

**Windows Command Prompt:**

```bat
set "VOID_API_URL=https://api.mdong.fyi" && set "VOID_TOKEN=void-anonymous-deploy" && npx void deploy --platform void --project live-qa-your-name-09
```

Keep using this folder and project for subsequent edits. Later deployments from this linked folder can omit `--project`. If you switch to another checkpoint folder, give it a new project name: checkpoints are standalone snapshots with their own migration histories.

## Run Locally

Stop any running development server with **Ctrl+C**. Apply the included migrations to your local database:

```bash
npx void db migrate
```

### Start the app

Use the checkpoint folder you deployed above; it is already connected and linked to your project. Start it with the anonymous workshop token using the command for your terminal.

### macOS / Linux

```bash
VOID_API_URL=https://api.mdong.fyi VOID_TOKEN=void-anonymous-deploy npm run dev
```

### Windows PowerShell

```powershell
$env:VOID_API_URL="https://api.mdong.fyi"; $env:VOID_TOKEN="void-anonymous-deploy"; npm run dev
```

### Windows Command Prompt

```bat
set "VOID_API_URL=https://api.mdong.fyi" && set "VOID_TOKEN=void-anonymous-deploy" && npm run dev
```

No Void platform or Cloudflare account login is needed. Your app runs locally; AI requests use the workshop platform, so keep an internet connection available.

Open the local URL, sign in to your app, and submit a few questions. Click **Classify** in the Current Questions panel. Each question should show a positive, neutral, or negative label.

### After changing the schema

Stop the development server, generate a migration, and review the new SQL:

```bash
npx void db generate
```

Apply it locally before restarting the app:

```bash
npx void db migrate
```

Keep the migration files with this app. Deployment applies pending migrations to the project's database.

## Test the scheduled email

Cron schedules do not run automatically in local development. To test the existing email helper locally, sign in, submit questions, and click **Email Summary**. Check the local inbox URL printed by Void; no real email is delivered locally. Test the automatic five-minute emails after deploying.

In the deployed app, create test accounts with real email addresses you control and submit a few questions. The `*/5 * * * *` schedule sends the current total to every registered user at minutes `00`, `05`, `10`, and so on, even with every app tab closed. Check each account's Inbox and Spam after the next run. Scheduling and delivery are approximate.

Each run sends a separate email to every registered app user, including users who are signed out or have not submitted questions. A failed delivery does not prevent the remaining users from receiving theirs; the job reports any failures after trying all recipients. With no registered users, no email is sent.

The manual **Email Summary** button still sends only to the signed-in account. Both paths use the same email helper, including a zero-question summary when the queue is empty.

Remove `crons/question-summary-email.ts` and redeploy to stop scheduled emails after the workshop.

The included cleanup migration removes the retired `question_spotlight` table while preserving questions, accounts, and classification results. Keep all existing migration files.

## Try Email Summary

Create an account in the deployed app with a real email address you control, sign in, submit questions, and click **Email Summary**. The recipient comes from the signed-in account; no Void platform login or recipient registration is needed. The workshop platform uses the `any` recipient policy.

The helper uses `Live Q&A <noreply@local.test>` only for the local dev inbox. In production, `sendEmail()` omits `from`, so Void supplies `<project-slug>+noreply@mail.mdong.fyi` automatically. Do not set a shared exact sender address.

Check Spam as well as Inbox: the earlier Gmail delivery test arrived in Spam.
