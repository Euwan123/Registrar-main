<div align="center">

# 🎓 USeP e-Registrar

### The Virtual Registrar Portal

Request academic documents, track progress, and manage registrar reviews in one place.

![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss&logoColor=white)
![TanStack Start](https://img.shields.io/badge/TanStack_Start-App-ff4154)

</div>

---

## ✨ What you can do

| For students                                           | For registrar staff                              |
| ------------------------------------------------------ | ------------------------------------------------ |
| Submit document requests and records corrections       | Review requests from a single dashboard          |
| Track request status and fulfillment progress          | Accept, decline, and advance request statuses    |
| Choose from available document and fulfillment options | View dashboard totals based on connected records |

The app can run in **demo mode** for local testing or **database mode** with Supabase.

## 🚀 Get started

### Requirements

- Node.js 20.19+ or 22.12+
- npm
- A Supabase project for database mode (optional for demo mode)

### Install and run

```bash
npm ci
npm run dev -- --host 127.0.0.1 --port 3000
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

> **Tip:** The example configuration defaults to demo mode. To customize your local setup, copy `.env.example` to `.env` and update the values for your chosen mode.

PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS / Linux:

```bash
cp .env.example .env
```

## 🗄️ Supabase database mode

1. Create a Supabase project and copy its project URL and keys into `.env`.
2. Set `APP_MODE=database`.
3. In the Supabase SQL Editor, run [`migrations/002_supabase_registrar_schema.sql`](./migrations/002_supabase_registrar_schema.sql).
4. Start the app and confirm the student and registrar pages load database records.

### Environment variables

| Variable                   | Purpose                                                              |
| -------------------------- | -------------------------------------------------------------------- |
| `APP_MODE`                 | Set to `database` for Supabase or `demo` for browser-local demo data |
| `SUPABASE_URL`             | Supabase project URL                                                 |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key                                             |
| `SUPABASE_SECRET_KEY`      | Server-only key used by database operations                          |
| `SUPABASE_JWKS_URL`        | Supabase Auth JSON Web Key Set URL                                   |

**Keep `SUPABASE_SECRET_KEY` private.** Never commit `.env`, paste secret keys into source files, or expose the server-only key in browser code. `.env` is ignored by Git; use `.env.example` as the safe configuration template.

### Migration notes

| File                                         | When to use it                                                                  |
| -------------------------------------------- | ------------------------------------------------------------------------------- |
| `002_supabase_registrar_schema.sql`          | Creates the Supabase tables and document types needed by the app                |
| `003_seed_demo_accounts_and_corrections.sql` | Optional demo records; do not run if you want a clean, production-like database |
| `004_add_request_purpose.sql`                | Adds the request-purpose column to an existing schema when it is missing        |
| `001_create_corrections_tables.sql`          | Legacy MySQL/MariaDB schema migration; separate from the Supabase setup above   |

Migration `003` also adds the `purpose` column. If you have already run it, you do not need migration `004`. For an existing Supabase database that lacks the column, run `004` instead.

## 🧪 Demo mode

Set `APP_MODE=demo` to try the portal without connecting to Supabase. Demo requests are stored in browser local storage, so they are available only in the same browser and origin. Demo data is separate from database records.

## 🛠️ Commands

| Command           | Description                        |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Start the local development server |
| `npm run build`   | Create a production build          |
| `npm run preview` | Preview the production build       |
| `npm run lint`    | Run ESLint                         |
| `npm run format`  | Format project files with Prettier |

## 🧭 Project map

```text
src/
├── routes/       Student, registrar, and API routes
├── components/   Shared UI and portal components
└── lib/          Authentication and registrar data access
migrations/       Supabase and legacy database SQL
public/           Static assets
```

## 🧱 Built with

- [React](https://react.dev/) and [TypeScript](https://www.typescriptlang.org/)
- [TanStack Start](https://tanstack.com/start)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) for database mode
