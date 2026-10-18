# Live Q&A Workshop Files

This bundle contains the app checkpoints used by the workshop.

`working-repo` is the app folder attendees edit during the live session.

Each checkpoint is a complete fallback app folder. If you get stuck during the live session, move into the matching checkpoint and continue from there.

```txt
working-repo/
checkpoints/
  02-database/
  03-websockets/
  04-auth/
  05-email/
  06-ai/
  07-queues/
  08-cron/
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

- `working-repo`: static starter
- `02-database`: persistent questions
- `03-websockets`: anonymous realtime question updates
- `04-auth`: email/password sign-in and question authors
- `05-email`: summaries sent to the signed-in account
- `06-ai`: Clef sentiment classification saved on each question
- `07-queues`: background AI classification, saved progress, and retries
- `08-cron`: the complete app, adding a summary email to every registered app user every five minutes

## Starting from a checkpoint

All database checkpoints (`02-database` through `08-cron`) include SQL migrations. Follow the checkpoint README to install dependencies, connect to the workshop platform, make the initial deployment with its explicit `--project` name, and prepare the local database in Run Locally. The static `working-repo` starter has no database and skips the migration step.

Choose a new project name for each standalone checkpoint, for example `live-qa-your-name-05`. Its first deployment creates and links the project. Continue later lessons in that same folder to keep its database and migration history. Do not deploy another checkpoint's independent initial migration onto a project with a different history.

This bundle uses the new Auth → Email → AI → Queues → Cron order. Extract it into a fresh folder when moving from an older download, and choose an unused project name for a standalone checkpoint. Keep existing app folders and their migration history if you need their data.

## Run Locally

Follow the Run Locally section in your app folder’s README to apply its included migrations and start the development server.

When changing a schema, stop the dev server, run `npx void db generate`, review the SQL, then run `npx void db migrate`. Keep those files with the app; do not switch back to `db push` or delete `_void_migrations`.

## Scheduled summary email

Lesson 08 is the final lesson and builds on the Queues app, keeping auth, email, realtime questions, and background AI classification. The job exports `"*/5 * * * *"` and runs automatically every five minutes after deployment, using the existing summary-email helper and the current question count.

Each run reads registered users from the app's existing auth database and sends a separate email to each address. Users do not need to be signed in or to have submitted a question. No recipient configuration is needed. A failed delivery does not prevent the remaining users from receiving theirs.

Cron schedules do not run automatically locally. Use the **Email Summary** button to test the email helper in the local inbox, then test the five-minute schedule after deployment. Emails continue with every app tab closed.

The final Cron checkpoint includes every feature from the earlier lessons. Remove `crons/question-summary-email.ts` and redeploy to stop scheduled emails after the workshop.

## Install Troubleshooting

Each app folder includes a local `.npmrc` that sends `@cloudflare/*` packages to the public npm registry.

If `npm install` still fails while downloading an `@cloudflare/*` package, check whether your machine is overriding the scoped registry:

```bash
npm config get @cloudflare:registry
```

For this workshop, it should resolve to:

```txt
https://registry.npmjs.org/
```

If it does not, ask the workshop helper before changing your global npm config.
