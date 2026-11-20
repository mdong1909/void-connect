# Live Q&A Workshop Files

This bundle contains the app checkpoints used by the workshop.

`working-repo` is the app folder attendees edit during the live session.

Each checkpoint is a complete fallback app folder. If you get stuck during the live session, move into the matching checkpoint and continue from there.

```txt
working-repo/
checkpoints/
  02-database/
  03-storage/
  04-websockets/
  05-auth/
  06-email/
  07-ai/
  08-queues/
  09-cron/
```

Every app folder includes the source directories used throughout the workshop. Empty directories have `.gitkeep` files so GitHub preserves the layout; the downloadable ZIP extracts them as empty directories.

The component variants for later lessons are also included in every app folder. Lessons activate them by changing imports in `pages/index.tsx`.

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
- `03-storage`: optional image attachments stored in R2
- `04-websockets`: anonymous realtime question updates
- `05-auth`: email/password sign-in and question authors
- `06-email`: summaries sent to the signed-in account
- `07-ai`: Clef sentiment classification saved on each question
- `08-queues`: background AI classification, saved progress, and retries
- `09-cron`: the complete app, adding a summary email to every registered app user every five minutes

## Starting from a checkpoint

All database checkpoints (`02-database` through `09-cron`) include SQL migrations. Follow the checkpoint README to install dependencies, connect to the workshop platform, make the initial deployment with its explicit `--project` name, and prepare the local database in Run Locally. The static `working-repo` starter has no database and skips the migration step.

Choose a new project name for each standalone checkpoint, for example `live-qa-your-name-06`. Its first deployment creates and links the project. Continue later lessons in that same folder to keep its database and migration history. Do not deploy another checkpoint's independent initial migration onto a project with a different history.

This bundle uses the Database → R2 storage → WebSockets → Auth → Email → AI → Queues → Cron order. Extract it into a fresh folder when moving from an older download, and choose an unused project name for a standalone checkpoint. Keep existing app folders and their migration history if you need their data.

## Run Locally

Follow the Run Locally section in your app folder’s README to apply its included migrations and start the development server.

When changing a schema, stop the dev server, run `npx void db generate`, review the SQL, then run `npx void db migrate`. Keep those files with the app; do not switch back to `db push` or delete `_void_migrations`.
