# Deploying this MERN app to Render

This repository contains a Node backend (root) and a Vite React frontend (`client/`). The backend serves static files from `client/dist` in production.

This guide shows the simplest approach: a single Render Web Service that builds the frontend during the build step and starts the backend.

## Preparations

1. Remove any secrets from `.env` files and ensure you have the following environment variables ready:
   - `MONGO_URI` — your MongoDB connection string
   - `JWT_SECRET` — a strong secret for signing JWTs
   - (optional) `PORT` — Render will supply a port, so you generally don't need to set this
   - For the frontend, optionally set `VITE_API_BASE` to the absolute backend URL (recommended in production)

2. Ensure the root `package.json` contains a `build` script that builds the frontend. This repository already includes:

   "build": "cd client && npm install && npm run build"

   and `start: node app.js`.

## Create a Web Service on Render (Single-service option)

1. In the Render dashboard click "New" → "Web Service".
2. Connect your GitHub repo and pick the `main` branch.
3. For **Build Command**, enter:

   npm install && npm run build

4. For **Start Command**, enter:

   npm start

5. Leave the **Environment** set to Node.

6. Add Environment Variables in the Render UI:
   - `MONGO_URI` = <your mongo uri>
   - `JWT_SECRET` = <your jwt secret>
   - (optional) `VITE_API_BASE` = https://your-service-name.onrender.com  (recommended when using separate frontend build or calling backend by full URL)

7. Create the service. Render will run the build; the root build step will build the client into `client/dist`. The Node server (`app.js`) serves this directory in production.

## Alternative: Two-service approach (frontend as Static Site)

If you prefer to deploy the frontend as a separate Static Site on Render:

- Create a **Static Site** for the `client/` folder. Build Command: `npm install && npm run build`; Publish directory: `client/dist`.
- Create a **Web Service** for the backend (root). Build Command: `npm install` (or `npm install && npm run build` if you want the backend to also build frontend), Start Command: `npm start`.
- Set `VITE_API_BASE` in the Static Site's settings to the backend's URL.

## Local verification steps (before pushing)

1. From project root, install server deps and build client:

```powershell
npm install
npm run build
```

2. Start the server locally:

```powershell
npm start
```

3. Visit `http://localhost:3000` (or the `PORT` you configured) and verify the frontend loads and API endpoints work.

## Notes and troubleshooting

- The server uses `process.env.PORT || 3000` so Render's assigned port will be used automatically.
- For frontend environment variables, Vite requires variables prefixed with `VITE_` (for example `VITE_API_BASE` or `VITE_API_PORT`). Set them on Render's dashboard for the Static Site or in your build environment.
- If you see CORS errors, set `VITE_API_BASE` to the backend URL (https) or serve frontend from the backend as the single-service approach does.

If you'd like, I can also:
- Add a `.dockerignore`/`Dockerfile` for containerized deploys.
- Split the repository into `backend/` and `client/` folders and update imports if you prefer that structure.
