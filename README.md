# AI Content Factory

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Framework: Next.js](https://img.shields.io/badge/Framework-Next.js%2016-black.svg)](https://nextjs.org/)
[![Database: Supabase](https://img.shields.io/badge/Database-Supabase%20Postgres-emerald.svg)](https://supabase.com/)

**AI Content Factory** is a professional, full-stack content creation management and workflow automation platform. Designed for creators, marketers, and developers, this repository demonstrates advanced software architecture, cloud database patterns, Row Level Security (RLS) protections, object storage integration, modular AI abstractions, and structured background workflows.

---

## 🚀 Key Features

* **Multi-Tenant Authentication**: Auth-guarded routing, session persistence, and secure cookie storage backed by Supabase Auth.
* **Content Ideation CRUD Board**: Catchy content pillars tracker with advanced searching, status badges, and category filtering.
* **AI Prompt Workshop**: Modular scripting studio to generate visual prompts (Midjourney, Sora) and social captions from text descriptions.
* **Secure Media Gallery**: Media library integrated with Supabase Storage buckets, restricted by UUID folder policies.
* **Background Workflows**: 3 built-in automations representing core daily ideation, automated prompt writes, and asset state verification.
* **AI Provider Design Pattern**: Dual-mode engine designed to toggle between free simulated mock generation and live OpenAI GPT-4o models with zero code modifications.

---

## 🛠️ Tech Stack

* **Frontend**: Next.js 16 (App Router), React 19, TypeScript
* **Styling**: Tailwind CSS v4, custom glassmorphism components
* **Backend**: Supabase, PostgreSQL
* **Storage**: Supabase Storage Buckets (`content-images`, `content-videos`)
* **AI Engines**: OpenAI API (`gpt-4o-mini`), Mock data fallback
* **Automation**: Antigravity modular workflow runners

---

## 📂 Project Structure

```text
ai-content-factory/
├── app/                  # Route handlers, layouts, and page views
│   ├── dashboard/        # Auth-guarded dashboard console
│   │   ├── assets/       # Media Upload & Gallery controls
│   │   ├── ideas/        # CRUD board for content concepts
│   │   ├── prompts/      # AI prompt workshop scripts
│   │   └── settings/     # Provider toggle & database purge tool
│   ├── globals.css       # Core Tailwind CSS imports & theme overrides
│   ├── layout.tsx        # Base root styling & context layout
│   └── page.tsx          # Login & Signup gating gateway
├── components/           # Extracted reusable UI components
│   ├── Header.tsx        # Top status header
│   └── Sidebar.tsx       # Main desktop/mobile drawer navigation
├── docs/                 # Systems guides and architecture manuals
│   ├── DEPLOYMENT_GUIDE.md
│   ├── PROJECT_ARCHITECTURE.md
│   └── SETUP_GUIDE.md
├── hooks/                # Centralized React hooks (e.g. useAuth)
├── lib/                  # Initialization logic & service wrapper classes
│   ├── ai/               # AI Provider classes (Mock, OpenAI, Factory)
│   └── supabase/         # Supabase client instantiation & helpers
├── services/             # Background automation workflow scripts
├── supabase/             # PostgreSQL database schemas
│   └── migrations/       # SQL init scripts & security policies
├── types/                # Centrally declared TypeScript interfaces
├── utils/                # String/Date formatter helpers
├── .env.example          # Environment variables template
├── tsconfig.json         # TypeScript configuration mappings
└── package.json          # Dependencies & execution scripts
```

---

## 🔄 Architectural Overview

The backend operations are governed by a strict relational data model secure at the query tier, executing multi-modal creations via the provider factory:

```mermaid
graph TD
    User([Content Creator]) -->|1. Registers Concept| Ideas[(Database: ideas table)]
    Ideas -->|Status: draft| Workflow2[Workflow 2: Auto-Prompt Writer]
    Workflow2 -->|2. Calls Factory| AI[Mock / OpenAI Provider]
    AI -->|3. Brainstorms Prompts & Copy| Prompts[(Database: prompts table)]
    Prompts -->|4. Transitions status to pending| Ideas
    User -->|5. Uploads Media Asset| Storage[(Supabase Storage Buckets)]
    Storage -->|6. Binds file URL| Assets[(Database: assets table)]
    Assets -->|7. Scans attached deliverables| Workflow3[Workflow 3: State Advancer]
    Workflow3 -->|8. Updates status to completed| Ideas
```

---

## 🛠️ Getting Started

### 1. Local Setup
Ensure you have Node.js `v18.x` or `v20.x` installed. Run the following commands to install packages and copy environment variables:
```bash
# Clone the repository
git clone https://github.com/LokeshSivarathri/AI-content-factory.git
cd AI-content-factory

# Install dependencies (legacy peer deps required for Tailwind compatibility)
npm install --legacy-peer-deps

# Copy environment settings
cp .env.example .env.local
```

For full setup instructions including database migrations and cloud storage bucket configurations, refer to the **[Local Setup & Integration Guide](file:///Users/PROJECTS/AI Content Factory/docs/SETUP_GUIDE.md)**.

### 2. Environment Variables Settings
Ensure the following variables are defined in your `.env.local` or host dashboard:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
DATABASE_URL=postgresql://postgres.your-project-ref:your-db-password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
OPENAI_API_KEY=MOCK_MODE
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
*(Note: If `OPENAI_API_KEY` is not set or set to `MOCK_MODE`, the system runs completely on the mock provider, allowing full feature execution for free.)*

### 3. Running the Project
Launch the Next.js Turbopack dev server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000` to start creating.

---

## 🚀 Production Deployment

This project builds successfully and is ready for production hosting:

1. **Frontend Hosting**: Deploy on **Vercel** with Next.js framework defaults.
2. **Redirect Configuration**: Set up Site URL and Wildcard redirects in **Supabase Auth** (`https://your-domain.vercel.app/**`) to handle session logins.

Refer to the **[Production Deployment Guide](file:///Users/PROJECTS/AI Content Factory/docs/DEPLOYMENT_GUIDE.md)** for a step-by-step walkthrough.

---

## 🔮 Future Improvements

* **Analytics Integration**: Dashboards showing views and engagement metrics for completed assets.
* **Asset Transformation**: Integrated image resizing and video transcoding directly in Supabase Edge Functions.
* **Auto-Publish API**: Direct publishing hooks to TikTok, Instagram Reels, and YouTube Shorts APIs.
* **Multi-model AI Orchestration**: Support for Anthropic Claude and Google Gemini in the provider factory.

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](file:///Users/PROJECTS/AI Content Factory/LICENSE) for more information.
