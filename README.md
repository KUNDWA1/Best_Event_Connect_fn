# Event Konnect Limited (Frontend)

Event Konnect is a modern event management platform that connects event planners and vendors.

## What this app includes

- Planner dashboard for creating and managing events
- Vendor profile and service package management
- Admin dashboard for platform management
- Booking flow between planners and vendors
- Multi-language support: English, French, and Kinyarwanda

## Tech stack

- React 18
- TypeScript
- Vite
- React Router v6
- Tailwind CSS
- i18next (internationalization)

## Step-by-step local setup

### 1. Prerequisites

Make sure you have the following installed:

- Node.js 18+ (recommended LTS)
- npm 9+

### 2. Clone and open the project

```bash
git clone <your-repo-url>
cd event_konnect_limited_fn
```

### 3. Install dependencies

```bash
npm install
```

### 4. Set up environment variables

Copy the example environment file to create your local `.env`:

```bash
cp .env.example .env
```

This configures your backend API URL. The default is already set to the remote API, but you can modify it if needed.

### 5. Start the development server

```bash
npm run dev
```

Then open the local URL shown in your terminal (usually `http://localhost:5173`).

### 6. Build for production

```bash
npm run build
```

### 7. Preview production build locally

```bash
npm run preview
```

## Seed data (test login accounts)

Use these seeded accounts to test different roles:

- Vendor
  - Email: `mihigo@gmail.com`
  - Password: `12345678`
- Event Planner
  - Email: `shyakaaimable555@gmail.com`
  - Password: `12345678`
- Admin
  - Email: `shyakaimable@gmail.com`
  - Password: `12345678`

## Language support

The app supports:

- English
- French (Francais)
- Kinyarwanda

Users can switch language from the language dropdown in the navigation bar.

## Available npm scripts

- `npm run dev`: Start Vite dev server
- `npm run build`: Type-check and build for production
- `npm run preview`: Serve the production build locally

## Project structure (high level)

- `src/components`: Reusable UI components
- `src/pages`: Route-level pages
- `src/context`: Global app state providers
- `src/hooks`: Custom React hooks
- `src/services`: API and external service logic
- `src/locales`: Translation resources
- `src/App.tsx`: Main app routing
- `src/main.tsx`: Application entry point

## Notes

- This frontend is currently configured to use a hosted backend API from `src/services/api.ts`.
- If the backend is unavailable, some authenticated/dashboard features may fail to load.
