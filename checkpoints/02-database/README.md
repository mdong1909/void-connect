# Checkpoint 02: Database

This checkpoint saves submitted questions to a database.

Submitting a question keeps your current username and refreshes the list from the database without reloading the page. Refreshing the page generates a new username; saved questions keep their original authors.

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

Replace `your-name` in `live-qa-your-name-02` with your own name and choose an unused project name for this checkpoint. The first deployment creates that project and links this folder to it.

**macOS / Linux:**

```bash
VOID_API_URL=https://api.mdong.fyi VOID_TOKEN=void-anonymous-deploy npx void deploy --platform void --project live-qa-your-name-02
```

**Windows PowerShell:**

```powershell
$env:VOID_API_URL="https://api.mdong.fyi"; $env:VOID_TOKEN="void-anonymous-deploy"; npx void deploy --platform void --project live-qa-your-name-02
```

**Windows Command Prompt:**

```bat
set "VOID_API_URL=https://api.mdong.fyi" && set "VOID_TOKEN=void-anonymous-deploy" && npx void deploy --platform void --project live-qa-your-name-02
```

Keep using this folder and project for subsequent edits. Later deployments from this linked folder can omit `--project`. If you switch to another checkpoint folder, give it a new project name: checkpoints are standalone snapshots with their own migration histories.

## Run Locally

Stop any running development server with **Ctrl+C**. Apply the included migrations to your local database:

```bash
npx void db migrate
```

### Start the app

```bash
npm run dev
```

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
