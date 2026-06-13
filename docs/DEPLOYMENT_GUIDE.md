# Production Deployment Guide

This guide describes how to publish the **AI Content Factory** to production using Vercel (frontend hosting) and Supabase (cloud database & storage).

---

## 🚀 Step 1: Push Project to GitHub

Create a public or private GitHub repository to host the source code:

1. Open your terminal in the root directory of your project.
2. Initialize Git (if not already done):
   ```bash
   git init
   ```
3. Commit all files:
   ```bash
   git add .
   git commit -m "feat: Initial AI Content Factory release"
   ```
4. Connect to your GitHub repository and push:
   ```bash
   git branch -M main
   git remote add origin https://github.com/your-username/your-repo-name.git
   git push -u origin main
   ```

*(Note: Double check that your `.env.local` is NOT pushed to GitHub. Check `.gitignore` to ensure it is ignored.)*

---

## ⚡ Step 2: Deploy to Vercel Tiers

Vercel provides seamless hosting for Next.js App Router applications:

1. Log in to the [Vercel Dashboard](https://vercel.com).
2. Click **Add New** > **Project**.
3. Import your GitHub repository (`your-repo-name`).
4. In the **Configure Project** pane:
   - **Framework Preset**: Set to **Next.js**.
   - **Root Directory**: Set to `./`.
5. Toggle the **Environment Variables** panel and add the production keys matching your local `.env.local` parameters:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL`
   - `OPENAI_API_KEY` (use `MOCK_MODE` to keep it running free without API cost, or your live token)
   - `NEXT_PUBLIC_APP_URL` (Set this to your expected Vercel URL, e.g. `https://your-app-ref.vercel.app`)

6. Click **Deploy**. Vercel will build and compile the application. Once complete, you will receive a public URL (e.g., `https://your-project-domain.vercel.app`).

---

## 🔒 Step 3: Align Supabase Auth Redirect URIs

If you use email confirmation workflows, you must align Supabase's redirect constraints with your live Vercel URL to allow cookie session tokens to pass successfully:

1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard) and go to your project.
2. Click **Authentication** in the sidebar, and navigate to **URL Configuration**.
3. In **Site URL**, input your live Vercel address:
   ```text
   https://your-project-domain.vercel.app
   ```
4. In **Redirect URLs**, click **Add URL** and add the wildcard redirect template:
   ```text
   https://your-project-domain.vercel.app/**
   ```
5. Click **Save**.

Now authentication confirmation links will redirect back to your dashboard with secure session cookies!
