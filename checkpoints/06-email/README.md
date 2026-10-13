# Checkpoint 06: Optional Email Notifications

This optional checkpoint keeps auth, WebSockets, and AI sentiment classification, then adds email notifications.

Create a local `.env` file before starting the dev server:

```txt
NOTIFICATION_EMAIL=you@example.com
```

```bash
npm install
npx void connect https://api.mdong.fyi --no-login
npx void db push
npm run dev
```

During local development, Void captures sent email in the local inbox instead of sending real messages.

