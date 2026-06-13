# Local Setup & Integration Guide

Follow this step-by-step guide to configure your credentials, build local packages, and link your Supabase cloud backend to your local workspace.

---

## 📋 Prerequisites

Ensure you have the following software installed:
- **Node.js**: `v18.x` or `v20.x` (LTS versions recommended)
- **npm**: `v9.x` or higher
- **Git**: For source control

---

## 🛠️ Step 1: Clone and Install Dependencies

1. Clone this repository to your computer:
   ```bash
   git clone https://github.com/LokeshSivarathri/AI-content-factory.git
   cd AI-content-factory
   ```
2. Download node modules. Due to React 19 and Next.js compatibility parameters in Tailwind CSS dependencies, utilize the legacy peer dependencies flag:
   ```bash
   npm install --legacy-peer-deps
   ```

---

## 🔑 Step 2: Environment Configurations

1. Copy the environment variables template file:
   ```bash
   cp .env.example .env.local
   ```
2. Open `.env.local` and configure your credentials. Refer to the table below for keys details:

| Variable Name | Description | Default / Example |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | The REST API endpoint of your Supabase project. Make sure it doesn't contain a trailing slash or `/rest/v1/`. | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client-safe anonymous API key. | `eyJhbGciOiJIUzI1NiIsInR5c...` |
| `SUPABASE_SERVICE_ROLE_KEY` | High-privilege bypass key. Do not commit this. | `eyJhbGciOiJIUzI1NiIsInR5c...` |
| `DATABASE_URL` | PostgreSQL connection pooler URI. | `postgresql://postgres.xxx...` |
| `OPENAI_API_KEY` | API token. Set to `MOCK_MODE` to run without API charges. | `MOCK_MODE` or `sk-proj-...` |
| `NEXT_PUBLIC_APP_URL` | Local dev server domain. | `http://localhost:3000` |

---

## 💾 Step 3: Supabase Cloud Database Setup

We must migrate our tables and set up row level security policies on your Supabase project:

1. Navigate to the [Supabase Console](https://supabase.com/dashboard) and log in.
2. Select your project, and click the **SQL Editor** icon in the left navigation sidebar.
3. Click **New Query**.
4. Open the SQL migration file:
   [20260613000000_init.sql](file:///Users/PROJECTS/AI Content Factory/supabase/migrations/20260613000000_init.sql)
5. Copy the entire file content, paste it into the Supabase SQL editor, and click **Run**.

This script executes the following schema operations:
- Creates `ideas`, `prompts`, and `assets` tables with relational constraints and cascading deletes.
- Enables **Row Level Security (RLS)** on all tables.
- Standardizes insert/select/delete policies bound by the user's UUID (`auth.uid()`).
- Creates two object storage buckets: `content-images` and `content-videos`.
- Configures RLS rules for media uploads, ensuring security at the path level.

---

## 🗄️ Step 4: Storage Configuration Verification

1. Go to the **Storage** section of your Supabase project dashboard.
2. Verify that two buckets are listed:
   - `content-images`
   - `content-videos`
3. Click the options menu (three dots) beside each bucket, choose **Edit Bucket**, and ensure that the **Public bucket** toggle is enabled. This allows the application to resolve and download media files directly from public URLs in image and video tags.

---

## 🚀 Step 5: Start the Dev Server

1. Run the local development server:
   ```bash
   npm run dev
   ```
2. Open your browser and navigate to:
   ```text
   http://localhost:3000
   ```
3. Click **Create Account** on the landing gate, fill in your details, and submit. You will enter the dashboard.
4. Go to the **Settings** view to confirm that the AI Engine is operational, and try creating an idea or running Workflow 1 from the dashboard overview console.
