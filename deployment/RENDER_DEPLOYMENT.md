# Render Backend Deployment Guide for Wits Quest

This guide covers step-by-step instructions to deploy the Node.js/Express backend (`backend/`) on **[Render](https://render.com)**.

---

## 1. Prerequisites

- An active account on [Render](https://dashboard.render.com/)
- Your Gmail account and App Password (for email authentication / 2FA verification codes)
- Your Supabase database credentials (`SUPABASE_URL` and `SUPABASE_KEY`)

---

## 2. Deploying on Render (Dashboard Walkthrough)

### Step 1: Create a New Web Service

1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** in the top navigation bar and select **Web Service**.
3. Connect your repository (GitHub/GitLab) or paste your Git repository URL:
   - If using the Wits SDP Git server directly, make sure Render has access or mirror/push to a repository accessible by Render.

### Step 2: Configure Service Settings

Configure the web service with the following fields:

| Field                  | Value                                  |
| ---------------------- | -------------------------------------- |
| **Name**               | `wits-quest-backend`                   |
| **Language / Runtime** | `Node`                                 |
| **Root Directory**     | `backend`                              |
| **Branch**             | `main` (or your active feature branch) |
| **Build Command**      | `npm install && npm run build`         |
| **Start Command**      | `npm start`                            |
| **Instance Type**      | `Free` (or Starter)                    |
| **Health Check Path**  | `/api/health`                          |

---

## 3. Environment Variables Configuration

In your Render Service Dashboard, navigate to the **Environment** tab and add the following environment variables:

| Key            | Example / Description                                                                                 |
| -------------- | ----------------------------------------------------------------------------------------------------- |
| `NODE_ENV`     | `production`                                                                                          |
| `PORT`         | `10000` _(Render sets this automatically, but backend handles it)_                                    |
| `JWT_SECRET`   | `witsquest_secret_jwt_key_2024_auth_token_super_secure_9812739128371` _(or any strong random string)_ |
| `SMTP_HOST`    | `smtp.gmail.com`                                                                                      |
| `SMTP_PORT`    | `465`                                                                                                 |
| `SMTP_USER`    | `mahlatseclayton1@gmail.com` _(your Google account email)_                                            |
| `SMTP_PASS`    | `ugtscmmjofelivxz` _(Google App Password)_                                                            |
| `SUPABASE_URL` | `https://<your-project>.supabase.co`                                                                  |
| `SUPABASE_KEY` | `<your-supabase-anon-or-service-role-key>`                                                            |

---

## 4. Connecting Frontend to the Render Backend

Once Render finishes deploying your backend:

1. Render will assign a public URL (e.g. `https://wits-quest-backend.onrender.com`).
2. Test the health endpoint in your browser or with curl:
   ```bash
   curl https://wits-quest-backend.onrender.com/api/health
   ```
   _Expected response:_
   ```json
   { "status": "ok", "service": "Wits Quest API (Supabase)", "timestamp": "..." }
   ```
3. Update your Frontend configuration (on Vercel or local `.env`):
   ```env
   VITE_API_URL=https://wits-quest-backend.onrender.com
   ```
