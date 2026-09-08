# Frontend

React + Vite frontend for the AI Automated Testing Workflow Prototype.

## Setup

```bash
npm install
npx playwright install chromium
```

## Run

```bash
npm run dev
```

Open:

```text
http://localhost:5173/generate-tests
```

## UI Automation

Keep the Flask backend running at `http://127.0.0.1:5000`, then run:

```bash
npm run test:ui
```

Expected result for the MVP demo:

```text
4 passed, 1 failed
```

`REG-002` is expected to fail because the backend intentionally preserves the username-length validation bug for the demo.
