# ONIT Frontend

Frontend application for **ONIT**, focused on delivering a fast, responsive, and maintainable user experience.

---

## Table of Contents

- [Overview](#overview)
- [Goals](#goals)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Application Flow](#application-flow)
- [Styling and UI](#styling-and-ui)
- [API Integration](#api-integration)
- [Build and Deployment](#build-and-deployment)
- [Quality and Standards](#quality-and-standards)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

This repository contains the frontend codebase for ONIT.  
It is responsible for:

- Rendering the web UI
- Managing client-side navigation
- Handling user interactions
- Connecting to backend APIs
- Managing client state and validation

The project is designed to be modular, scalable, and easy to maintain as product requirements evolve.

---

## Goals

- Provide a clean and intuitive user interface
- Ensure fast page loads and smooth interactions
- Keep code organized and easy to extend
- Support environment-based configuration (development, staging, production)
- Maintain consistent code quality through linting and formatting

---

## Tech Stack

> Adjust this section to match actual dependencies in `package.json`.

Typical stack for this project type:

- **Framework:** React
- **Build Tool:** Vite or Create React App
- **Language:** JavaScript / TypeScript
- **Routing:** React Router
- **State Management:** Context API / Redux / Zustand
- **HTTP Client:** Fetch API / Axios
- **Styling:** CSS Modules / Tailwind CSS / SCSS / Styled Components
- **Linting & Formatting:** ESLint + Prettier

---

## Project Structure

```txt
onit-frontend/
├─ public/                 # Static assets
├─ src/
│  ├─ assets/              # Images, icons, fonts
│  ├─ components/          # Reusable UI components
│  ├─ pages/               # Route-level pages/views
│  ├─ layouts/             # Shared layout wrappers
│  ├─ services/            # API clients and request logic
│  ├─ hooks/               # Custom React hooks
│  ├─ context/ or store/   # App-wide state management
│  ├─ utils/               # Helpers and utilities
│  ├─ constants/           # App constants/config
│  ├─ styles/              # Global styles/themes
│  ├─ App.(jsx|tsx)        # Root app component
│  └─ main.(jsx|tsx)       # Entry point
├─ .env.example            # Environment variable template
├─ package.json
└─ README.md
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- npm, yarn, or pnpm

### Installation

```bash
# 1) Clone the repository
git clone <repository-url>

# 2) Navigate into the frontend project
cd onit-frontend

# 3) Install dependencies
npm install
```

### Run in Development

```bash
npm run dev
```

If the project uses Create React App instead of Vite:

```bash
npm start
```

The app will be available at the local URL shown in your terminal (commonly `http://localhost:5173` or `http://localhost:3000`).

---

## Environment Variables

Create a local environment file:

```bash
cp .env.example .env
```

Typical variables:

```env
VITE_API_BASE_URL=https://api.example.com
VITE_APP_ENV=development
```

> For CRA projects, variables usually start with `REACT_APP_` instead of `VITE_`.

Do not commit secrets to source control.

---

## Available Scripts

> Verify exact script names in `package.json`.

- `npm run dev` – Starts development server
- `npm run build` – Builds production bundle
- `npm run preview` – Previews production build locally
- `npm run lint` – Runs ESLint checks
- `npm run format` – Formats code with Prettier
- `npm test` – Runs test suite (if configured)

---

## Application Flow

1. User opens the app
2. Router resolves the current route
3. Page component loads and requests required data
4. Global/local state updates based on API responses
5. UI re-renders with loading, success, or error states
6. User actions trigger further state changes and requests

---

## Styling and UI

The frontend follows a component-driven approach:

- Reusable components for consistency
- Centralized design tokens (colors, spacing, typography)
- Responsive behavior for mobile and desktop
- Accessibility-first patterns (semantic HTML, keyboard support, labels)

---

## API Integration

API communication is centralized in the `services/` layer.

Recommended patterns:

- Single source for base URL and headers
- Request/response interceptors (if Axios is used)
- Structured error handling and user-friendly messages
- Token-based authentication handling where applicable

Example service pattern:

```js
// src/services/api.js
export async function getData(endpoint) {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`);
    if (!response.ok) throw new Error("Request failed");
    return response.json();
}
```

---

## Build and Deployment

### Production Build

```bash
npm run build
```

Generated output is typically in:

- `dist/` (Vite)
- `build/` (CRA)

### Deployment Targets

This frontend can be deployed to:

- Azure Static Web Apps
- Vercel
- Netlify
- AWS S3 + CloudFront
- Nginx static hosting

Ensure environment variables are configured in the hosting platform.

---

## Quality and Standards

- Use ESLint and Prettier before commits
- Keep components small and focused
- Prefer typed props/interfaces where applicable
- Avoid hardcoded API URLs and secrets
- Write clear commit messages and PR descriptions

---

## Troubleshooting

### Dependency issues

```bash
rm -rf node_modules package-lock.json
npm install
```

### Environment variable not detected

- Confirm correct prefix (`VITE_` or `REACT_APP_`)
- Restart development server after `.env` changes

### Build fails locally but works in CI

- Check Node.js version consistency
- Run lint and type checks locally
- Verify case-sensitive import paths

---

## Contributing

1. Create a feature branch
2. Implement changes in focused commits
3. Run lint/tests/build locally
4. Open a pull request with:
     - Problem statement
     - Solution summary
     - Screenshots (if UI changes)

---

## License

Add your project license here (for example: MIT).

```txt
MIT License
```

If no license is intended yet, keep this section and update later.

---

## Maintainers

- ONIT Frontend Team

For internal project questions, contact the project maintainers.
