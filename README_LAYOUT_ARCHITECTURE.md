# Client_Deployment Repository Overview

## Purpose
This repository contains the React/Vite frontend for RevReview. It renders the public site, car browsing pages, login and admin flows, forms, and search-related views, and it is prepared for deployment through Vercel.

## File Layout

```text
Client_Deployment/
├── package.json
├── vite.config.js
├── eslint.config.js
├── vercel.json
├── index.html
├── dotnet-tools.json
├── README.md
├── JSON/
├── public/
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   ├── main.jsx
│   ├── Styling_eg.css
│   ├── assets/
│   ├── Components/
│   ├── hooks/
│   ├── JSON/
│   ├── Pages/
│   ├── services/
│   └── utils/
└── Client_Deployment/
    ├── config/
    └── JSON/
```

## Architecture Layout

The frontend is a single-page application built with React 19 and Vite. The app bootstrap path is:

1. `src/main.jsx` mounts the React tree into `#root`.
2. `BrowserRouter` provides client-side routing.
3. `src/App.jsx` defines the top-level app shell and route table.
4. Route targets are code-split with `React.lazy` and rendered inside `Suspense`.

The visual shell is assembled around the routed pages:

- `Navbar`, `Footer`, `AdBanner`, and `Forms` stay outside the route switch so they remain consistent across pages.
- Page components live under `src/Pages` and represent the primary screens such as Home, Brands, CarStats, Login, Admin, SearchResults, PrivacyPolicy, RevCalculator, and RevDistance.
- Reusable UI pieces live under `src/Components` and cover tables, search bars, modals, banners, forms, statistics, and navigation widgets.
- Shared browser-state and viewport logic is handled by `src/hooks/useWindowSize.js`.

## Runtime Flow

Typical browser flow:

`index.html -> main.jsx -> App.jsx -> route component -> shared UI components -> API/service calls`

The app uses responsive viewport classes derived from `useWindowSize` to adapt layouts for mobile, tablet, and desktop widths. Analytics and performance tracking are added at the app shell level through Vercel Analytics and Speed Insights.

## External Concerns

- `src/config/SupabaseClient.js` centralizes backend client configuration.
- `src/services/api.js` contains network access helpers.
- `vercel.json` defines deployment behavior for the hosted frontend.
- The `JSON` folders hold static data files such as model names and test fixtures.
