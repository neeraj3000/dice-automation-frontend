# Apply2Hire – Frontend

Vite + React 19, Redux Toolkit (RTK Query), Framer Motion, Tailwind CSS v4.

```bash
npm install
npm run dev      # http://localhost:5173  (proxies /api -> http://localhost:8000)
npm run build
```

- `.env`: `VITE_GOOGLE_CLIENT_ID`, `VITE_API_URL` (use the full API URL in production, e.g. `https://api.example.com/api/v1`).
- Google sign-in: add `http://localhost:5173` (and your production origin) under **Authorized JavaScript origins** for the client ID.
- Structure: `src/features/<feature>` (api + pages + components), `src/components/ui` (design system), `src/app` (store, base query with single-flight token refresh).
- Add a job board to the UI in `src/features/boards/boardRegistry.js`.
