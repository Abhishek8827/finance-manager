# Finance Manager

A personal finance tracker with a React frontend and an Express API backed by MongoDB.

## Features

- Track income, expenses, accounts, and transfers
- Manage loans and review financial summaries
- Configure transaction categories and account settings
- Installable progressive web app frontend

## Requirements

- Node.js 22 or 24 (LTS)
- npm
- A MongoDB connection string (local MongoDB or MongoDB Atlas)

## Getting Started

Install dependencies in each application folder:

```sh
cd backend
npm install
```

```sh
cd frontend
npm install
```

Create local environment files from the examples. In PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Set `MONGODB_URI` in `backend/.env` to your MongoDB connection string. Set `APP_ACCESS_PASSWORD` to a unique password with at least 12 characters and `JWT_SECRET` to a random secret with at least 32 characters. The API fails closed and returns 503 for data routes until both are configured. Generate a JWT secret with `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`. `VITE_API_URL` in `frontend/.env` defaults to `http://localhost:5000/api`.

Start the backend and frontend in separate terminals:

```sh
cd backend
npm run dev
```

```sh
cd frontend
npm run dev
```

Open the frontend URL printed by Vite (by default, `http://localhost:5173`). The API health endpoint is `http://localhost:5000/api/health`.

To add the default accounts and categories to an empty database, run `npm run seed` from `backend`. Use the intended database: this command writes data to the database configured by `MONGODB_URI`.

## Production Configuration

Set `MONGODB_URI`, `PORT`, `FRONTEND_URL`, `APP_ACCESS_PASSWORD`, and `JWT_SECRET` as backend secrets. Set `VITE_API_URL` in the frontend environment to the deployed API base URL, including `/api`. Configure `FRONTEND_URL` as the exact origin serving the frontend. Keep the access password and JWT secret out of the frontend build and source control. The app uses one shared password; all authorized sessions can access every account. Tokens are held in memory, expire after 12 hours, and are cleared from the browser when the user locks the app. Login attempts are rate-limited per backend process. Do not publish `.env` files or real financial data.

## Project Structure

- `backend/` - Express API, MongoDB models, routes, and seed script
- `frontend/` - React application built with Vite

## License

No license has been specified yet. Add a license before granting public reuse rights.
