# Finance Manager

A personal finance tracker with a React frontend and an Express API backed by MongoDB.

## Features

- Track income, expenses, accounts, and transfers
- Manage loans and review financial summaries
- Configure transaction categories and account settings
- Installable progressive web app frontend

## Requirements

- Node.js 18 or newer
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

Set `MONGODB_URI` in `backend/.env` to your MongoDB connection string. The remaining backend example values use local development defaults. `VITE_API_URL` in `frontend/.env` defaults to `http://localhost:5000/api`.

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

Set `MONGODB_URI`, `PORT`, and `FRONTEND_URL` in the backend environment. Set `VITE_API_URL` in the frontend environment to the deployed API base URL, including `/api`. Configure `FRONTEND_URL` as the exact origin serving the frontend. Do not publish `.env` files or real financial data.

## Project Structure

- `backend/` - Express API, MongoDB models, routes, and seed script
- `frontend/` - React application built with Vite

## License

No license has been specified yet. Add a license before granting public reuse rights.
