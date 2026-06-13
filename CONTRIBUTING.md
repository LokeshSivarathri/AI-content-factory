# Contributing to AI Content Factory

Thank you for your interest in contributing to the **AI Content Factory**! We welcome contributions from developers of all skill levels. By participating in this project, you help make it better for the community.

---

## 📋 Code of Conduct

We expect all contributors to maintain a respectful, welcoming, and professional environment. Please be constructive and encouraging in issues, pull requests, and discussions.

---

## 🛠️ Development Workflow

### 1. Fork & Clone
1. Fork this repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/LokeshSivarathri/AI-content-factory.git
   cd AI-content-factory
   ```

### 2. Configure Environment
1. Copy the example configuration:
   ```bash
   cp .env.example .env.local
   ```
2. Set up your local Supabase database and add the required variables.

### 3. Create a Branch
Always create a descriptive branch for your changes:
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b bugfix/issue-description
```

### 4. Install Dependencies
Ensure you resolve peer dependencies properly due to React 19 compatibility requirements:
```bash
npm install --legacy-peer-deps
```

---

## 🎨 Coding Standards

To maintain a clean and professional codebase, please follow these guidelines:

### TypeScript & Linting
- All files must compile without errors. Use TypeScript strictly.
- Run the linter before committing to catch formatting and syntax issues:
  ```bash
  npm run lint
  ```

### Directory Conventions
- **`app/`**: Next.js pages, layouts, and global styles. Keep logic outside route files where possible.
- **`components/`**: Modular, reusable UI components.
- **`hooks/`**: Shared custom React hooks.
- **`lib/`**: External service integrations and client initializations (e.g. Supabase, AI Provider).
- **`services/`**: Core business workflows and automation logic.
- **`types/`**: Centrally declared shared TypeScript interfaces.
- **`utils/`**: General helper utilities (e.g. string formatting, date parsing).

### Imports
- Use Next.js path aliases (`@/`) rather than nested relative paths for all root modules.
  - **Correct**: `import { useAuth } from '@/hooks/useAuth';`
  - **Incorrect**: `import { useAuth } from '../../../hooks/useAuth';`

---

## 🚀 Submitting Changes

### Commit Messages
Follow the **Conventional Commits** specification:
- `feat: ...` for new features
- `fix: ...` for bug fixes
- `docs: ...` for documentation updates
- `style: ...` for formatting or CSS adjustments
- `refactor: ...` for restructuring code
- `test: ...` for adding tests

### Pull Requests
1. Push your branch to your GitHub fork:
   ```bash
   git push origin feature/your-feature-name
   ```
2. Open a Pull Request against our `main` branch.
3. Provide a clear summary of what your changes accomplish, any files modified, and verification steps completed.
4. Ensure the codebase builds successfully:
   ```bash
   npm run build
   ```
