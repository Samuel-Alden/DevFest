# TriagePeace

A lightweight offline-capable patient triage queue for field / clinic use.

Built with **React**, **Vite**, and **Tailwind CSS v4**.

## Features

- Patient intake form (name, age, severity, symptoms)
- Live triage queue with severity badges (critical / urgent / stable)
- Online / offline status bar + offline submission counter
- Simple doctor/admin login (unlocks resolve + in-progress controls)
- Mobile-first UI

## Quick start

```bash
npm install
npm run dev
```

Then open the URL shown in the terminal (usually `http://localhost:5173`).

## Scripts

| Command           | Description              |
|-------------------|--------------------------|
| `npm run dev`     | Start development server |
| `npm run build`   | Production build         |
| `npm run preview` | Preview production build |

## Project structure

```
src/
├── App.jsx                 # Main app state & orchestration
├── main.jsx
├── index.css
├── components/
│   ├── StatusBar.jsx
│   ├── Header.jsx
│   ├── LoginModal.jsx
│   ├── PatientIntake.jsx
│   └── PatientQueue.jsx
└── hooks/
    └── useOnlineStatus.js
```

## Notes

- Login is intentionally simple (any non-empty ID + PIN works) — replace with real auth for production.
- Patient data lives in React state only (no backend / localStorage yet).
- The image in `public/itk-img.webp` is available if you want to add branding later.
