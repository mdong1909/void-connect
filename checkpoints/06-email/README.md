# Checkpoint 06: Optional Email Summary

This optional checkpoint keeps auth, WebSockets, and AI sentiment classification, then adds a button that emails the signed-in site visitor a question-count summary.

```bash
npm install
npx void connect https://api.mdong.fyi --no-login
npx void db push
npm run dev
```

During local development, Void captures sent email in the local inbox instead of sending real messages. Click **Email Summary** to send the current question count to the signed-in email address.

