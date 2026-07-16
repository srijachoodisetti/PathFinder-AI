# PathFinder AI - Production Deployment Guide

This guide details the steps to deploy the PathFinder AI application as two separate services:
1. **Backend** (FastAPI) deployed on **Render** (as a Web Service).
2. **Frontend** (React + Vite) deployed on **Vercel** or **Firebase Hosting**.

---

## 🐍 Backend Deployment on Render

You can deploy the backend using Render's native **Python** environment (Recommended) or the automatically detected **Node.js** environment.

### Option A: Using Render Blueprints (Recommended)
1. Commit all files (including [render.yaml](file:///l:/Nxtwave%20hackaton/render.yaml)) and push them to your GitHub repository.
2. In the Render Dashboard, click **New** -> **Blueprint**.
3. Link your GitHub repository. Render will automatically configure the service using Python, set the build commands, and set the environment variables.

### Option B: Manual Web Service Setup (Python Environment - Recommended)
1. In the Render Dashboard, click **New +** and select **Web Service**.
2. Link your GitHub repository.
3. Configure the following fields:
   - **Name**: `pathfinder-backend`
   - **Runtime**: `Python`  <-- *Make sure to select Python*
   - **Root Directory**: `(leave blank)`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `python run.py`
4. Add the following **Environment Variables**:
   - `PORT`: `8000` (Render will automatically override this, but it serves as a fallback)
   - `SECRET_KEY`: *(Any secure random string, e.g., `my-super-secret-key-1234`)*
   - `GEMINI_API_KEY`: *(Your Google Gemini API Key)*
   - `CORS_ORIGINS`: `https://your-frontend-domain.vercel.app` (Replace with your actual deployed frontend URL once deployed)
   - `PRODUCTION`: `true`

### Option C: Standby Node.js Environment (Zero-Configuration Fallback)
If Render automatically builds your repository as a Node.js project (due to the root-level `package.json`), the build will still succeed!
- **Build Command**: `yarn build` (which automatically runs `pip install -r backend/requirements.txt` via our `package.json` configuration)
- **Start Command**: `yarn start` (which runs `python run.py` to start the backend)
- Simply configure the **Environment Variables** in the Render settings tab as described in Option B above.

---

## ⚛️ Frontend Deployment

The React frontend should be built and deployed to a static hosting provider.

### Option A: Deploying on Vercel
1. Sign in to your [Vercel Dashboard](https://vercel.com) and click **Add New** -> **Project**.
2. Import your GitHub repository.
3. Configure the project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
4. Expand **Build and Development Settings** and verify:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables** and add the following keys:
   - `VITE_API_URL`: `https://your-backend-api-url.onrender.com/api/v1` (Use the URL of your deployed Render backend)
   - Add the Firebase configurations from your local `frontend/.env` file:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`
     - `VITE_FIREBASE_MEASUREMENT_ID`
6. Click **Deploy**.
7. Copy your deployed Vercel domain (e.g., `https://pathfinder-ai.vercel.app`) and update the `CORS_ORIGINS` environment variable in your Render backend settings.

---

### Option B: Deploying on Firebase Hosting
1. Install the Firebase CLI tool globally:
   ```bash
   npm install -g firebase-tools
   ```
2. Navigate to the `frontend/` directory and log in to Firebase:
   ```bash
   cd frontend
   firebase login
   ```
3. Initialize Firebase in the `frontend` folder:
   ```bash
   firebase init hosting
   ```
   - Select your existing Firebase project (`pathfinder-ai-project`).
   - What do you want to use as your public directory? Enter `dist`.
   - Configure as a single-page app (rewrite all urls to /index.html)? Enter `y` (Yes).
   - Set up automatic builds and deploys with GitHub? Enter `n` (No).
4. Create a `.env.production` file inside the `frontend/` directory and define your variables:
   ```env
   VITE_API_URL=https://your-backend-api-url.onrender.com/api/v1
   VITE_FIREBASE_API_KEY=...
   ... (other Firebase variables)
   ```
5. Build and deploy:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```
6. Update the `CORS_ORIGINS` environment variable in your Render backend settings with your Firebase Hosting URL.
