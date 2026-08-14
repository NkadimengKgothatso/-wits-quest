# Vercel Deployment & CI/CD Guide

## Overview
This document outlines the CI/CD pipeline and deployment strategy using Vercel for the **Wits Quest** project.

The Wits Quest project is a monorepo containing a Vite + React frontend (`frontend/`) and a Node backend (`backend/`). This guide specifically covers deploying the frontend to Vercel.

## CI/CD Pipeline
- **Continuous Integration (CI):** We will use Vercel's built-in CI/CD to handle automated builds. Gitea Actions can be added later for running `npm run lint` and tests before deployment if needed.
- **Continuous Deployment (CD):** Merging code into the `main` branch will automatically trigger a production deployment on Vercel.

## Vercel Setup Instructions for Wits Quest

Since this repository is hosted on **Gitea**, which doesn't have a native dashboard integration on Vercel like GitHub does, the easiest way to deploy is using the Vercel CLI.

### Step 1: Install Vercel CLI
Ensure you have the Vercel CLI installed globally:
```bash
npm i -g vercel
```

### Step 2: Initialize Vercel in the Project
Navigate to the root of the project and run:
```bash
vercel login
vercel
```

During the setup prompt, answer with the following specific configuration for this project:

- **Set up and deploy?** `Y`
- **Which scope do you want to deploy to?** [Select your Vercel team/account]
- **Link to existing project?** `N` (If this is the first time)
- **What's your project's name?** `wits-quest`
- **In which directory is your code located?** `./frontend` *(This is critical!)*
- **Auto-detected Project Settings (Vite):**
  - **Build Command:** `npm run build` or `tsc && vite build` (Vercel will auto-detect Vite)
  - **Development Command:** `vite`
  - **Install Command:** `npm install`
  - **Output Directory:** `dist`
- **Want to modify these settings?** `N` (The defaults for Vite in the frontend directory are correct).

### Step 3: Production Deployments (CI/CD from Gitea)

To set up automated deployments from Gitea, you have two options:

**Option A: Vercel Deploy Hooks (Recommended)**
1. Go to your project settings in the Vercel Dashboard -> **Git** -> **Deploy Hooks**.
2. Create a new Deploy Hook named "Gitea Main Branch" targeting `main`.
3. Copy the URL.
4. Go to your Gitea repository settings -> **Webhooks**.
5. Add a new webhook for `Push Events` and paste the Vercel Hook URL.

**Option B: Gitea Actions**
You can use a Gitea Action workflow with the Vercel CLI to deploy automatically on push:
1. Generate a Vercel Token in your Vercel account settings.
2. Add `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` as secrets in your Gitea repository.
3. Create a workflow file (e.g. `.gitea/workflows/deploy.yml`) that runs `vercel pull --yes --environment=production --token=$VERCEL_TOKEN` and `vercel build --prod --token=$VERCEL_TOKEN` followed by `vercel deploy --prebuilt --prod --token=$VERCEL_TOKEN`.

### Environment Variables
If your frontend needs to communicate with the backend, ensure you add the environment variable (e.g., `VITE_API_URL`) in the Vercel Dashboard under **Settings -> Environment Variables**.

## Next Actions
- [ ] Run `vercel login` and `vercel` in the project root to set up the Vercel link.
- [ ] Configure the Deploy Hook in Gitea for automatic deployments.
- [ ] Add backend API URLs to Vercel Environment Variables once the backend is deployed.
