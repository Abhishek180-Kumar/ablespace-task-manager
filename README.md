# AbleSpace Task Manager

A full-stack task management system built for the AbleSpace Full Stack Developer assessment.

## Live Links

- **Frontend (Vercel):** https://ablespace-task-manager-beta.vercel.app/
- **Backend API (Render):** https://ablespace-task-manager.onrender.com
- **GitHub Repo:** https://github.com/Abhishek180-Kumar/ablespace-task-manager

> **Note on cold start:** The backend is hosted on Render's free tier, which spins down after periods of inactivity. The **first request after inactivity can take 30-50 seconds** to respond while the server wakes up. Subsequent requests are fast. Please wait on the first load — this is a free-tier hosting limitation, not a bug.

## Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS
- **Backend:** NestJS, TypeScript
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT-based auth with Guest Login support
- **Deployment:** Vercel (frontend), Render (backend)

## Features

- Email/password auth + Guest Login (no signup required to try the app)
- Full Task CRUD: create, edit, delete, status updates (Pending / In Progress / Completed)
- Trash & Restore — soft-deleted tasks can be recovered instead of being lost permanently
- Task filtering by status and priority, with pagination
- List view and Board (Kanban-style, drag-and-drop) view
- Dark / Light theme toggle, persisted across page refreshes (localStorage)
- Fully responsive layout — desktop, tablet, and mobile
- Reusable component library (TaskList, TaskBoard, TaskForm, Navbar, AuthGuard, ConfirmDialog)
- Input validation on both frontend (form-level) and backend (NestJS DTOs + class-validator)

## Project Structure

```
ablespace-task-manager/
├── backend/          # NestJS API
│   ├── src/
│   │   ├── auth/     # JWT auth, guest login, guards, strategies
│   │   ├── tasks/    # Task CRUD module
│   │   └── users/    # User schema & service
│   └── .env.example
├── frontend/         # Next.js app
│   ├── app/          # App Router pages (dashboard, login, register, tasks)
│   ├── components/   # Reusable UI components
│   └── lib/          # API client, auth context, theme context
└── README.md
```

## Running Locally

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in MongoDB URI and JWT secret
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Backend runs on `http://localhost:3000` by default (see `backend/.env.example` → `PORT`). Since Next.js dev server also defaults to port 3000, start the backend first — the frontend will then automatically fall back to `http://localhost:3001`. `frontend/.env.example` → `NEXT_PUBLIC_API_URL` already points at `http://localhost:3000` for you.

## Design Fidelity Notes

Implementation follows the provided Figma design
(https://www.figma.com/design/obONCFmoTFN27V5H9PHS2X/Assessment-Task).

**Intentional deviations from Figma:**
- **Login page:** Added an email/password "Sign in" form and a "Create an account" link above the Guest/Google buttons. The Figma design only shows Guest Login and Login with Google — email/password auth was added as an extra entry point so the app is usable without relying on OAuth or a shared guest account.
- **Task detail — Subtasks:** Figma shows subtasks as a full table (each with its own Priority, Members, and Due Date). The current build keeps subtasks as a simple checklist (title + checkbox) to keep task creation fast; per-subtask priority/assignee/due-date was left out of scope for this pass.
- **Task detail — Details sidebar:** Members is shown as a single read-only assigned owner rather than Figma's multi-avatar picker with an "Add members" action. Labels and Reporter are set from the task creation/edit form instead of being editable inline from this sidebar, and a separate "Teams" field was not implemented.
- **Sidebar navigation:** Added a "Trash" item (soft-delete + restore for tasks) that isn't part of the Figma nav — included as an extra safety net beyond the original scope.

No other intentional deviations — layout, spacing, theme system (light/dark + 6 accent colors), and the Projects/Tasks table structure follow the Figma design closely.

## Part 2 — Product Understanding

See `AbleSpace_Part2_Walkthrough.docx` in the repo root for the full AbleSpace
Caseload → Take Data screen walkthrough (with screenshots) and suggested UX/UI improvements.

## Author

Abhishek Kumar — [GitHub](https://github.com/Abhishek180-Kumar)
