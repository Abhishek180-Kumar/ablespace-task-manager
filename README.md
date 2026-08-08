# AbleSpace Task Manager

A full-stack task management system built for the AbleSpace Full Stack Developer assessment.

- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **Backend:** NestJS + TypeScript
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT (email/password + guest login)

## Features

- Register / login / guest login (JWT-based)
- Create, edit, delete (soft delete), and restore tasks
- Filter tasks by status and priority
- Search tasks by title
- Pagination
- Trash view for soft-deleted tasks, with restore
- Light/dark theme toggle, persisted across refreshes
- Password hashes and internal fields are never sent to the client
- Fully typed backend (no `any` in request handlers), input validation via `class-validator`

## Project structure

```
ablespace-task-manager/
├── backend/   # NestJS API
└── frontend/  # Next.js app
```

## Getting started locally

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # then fill in MONGODB_URI and JWT_SECRET
npm run start:dev      # http://localhost:3000
```

You need a MongoDB connection string. The quickest option is a free cluster on
[MongoDB Atlas](https://www.mongodb.com/cloud/atlas) — create a cluster, add a database user,
allow access from your IP (or `0.0.0.0/0` for quick testing), and copy the connection string
into `MONGODB_URI`.

Generate a strong `JWT_SECRET` with:

```bash
openssl rand -base64 48
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:3000
npm run dev                  # http://localhost:3001 (or whichever port Next.js picks)
```

### 3. Verify everything works

Backend:
```bash
npm run build   # compiles cleanly
npm run lint    # 0 errors
npm run test    # unit tests pass
```

Frontend:
```bash
npm run build   # compiles cleanly
npm run lint    # 0 errors
```

Both have been verified to pass as of this submission.

## API overview

All endpoints except `/auth/*` and `/health` require `Authorization: Bearer <token>`.

| Method | Endpoint              | Description                        |
|--------|------------------------|-------------------------------------|
| POST   | `/auth/register`       | Register with name/email/password  |
| POST   | `/auth/login`          | Login with email/password          |
| POST   | `/auth/guest-login`    | Get a token as a guest user         |
| GET    | `/users/me`             | Current user profile               |
| PATCH  | `/users/me`             | Update profile                     |
| PATCH  | `/users/me/password`    | Change password                    |
| GET    | `/tasks`                | List tasks (filter/search/paginate)|
| POST   | `/tasks`                | Create a task                      |
| GET    | `/tasks/:id`            | Get one task                       |
| PATCH  | `/tasks/:id`            | Update a task                      |
| DELETE | `/tasks/:id`            | Soft-delete a task                 |
| POST   | `/tasks/:id/restore`    | Restore a soft-deleted task        |
| GET    | `/tasks/deleted`        | List soft-deleted tasks            |
| GET    | `/health`               | Health check                       |

## Deployment

**Backend** — any Node host works (Render, Railway, Fly.io). General steps:
1. Push this repo to GitHub.
2. Create a new web service pointing at `backend/`.
3. Build command: `npm install && npm run build`. Start command: `npm run start:prod`.
4. Set env vars: `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN` (your deployed
   frontend URL, comma-separated if you need more than one).

**Frontend** — [Vercel](https://vercel.com) is the simplest option for Next.js:
1. Import the repo, set the root directory to `frontend/`.
2. Set env var `NEXT_PUBLIC_API_URL` to your deployed backend URL.
3. Deploy.

**Database** — MongoDB Atlas free tier is sufficient for this assessment.

## Known deviations / limitations

- **Figma design fidelity:** I did not have access to the linked Figma file (it required a
  login I don't have). The UI was built from the written requirements and general task-manager
  conventions rather than pixel-matched against the design. Please compare against the actual
  Figma file and adjust spacing/color/typography as needed.
- **Part 2 (AbleSpace product walkthrough):** This requires access to the AbleSpace product
  itself (Caseload tab → Take Data screen), which isn't available here. This needs to be
  completed separately with real product access.
- **Live deployed URL:** Not yet deployed — see the Deployment section above for the steps to
  do this.
- **GitHub repo:** This zip is not yet pushed to a repo. The assessment asks for multiple small,
  meaningful commits — worth doing an incremental `git init` + staged commits per feature rather
  than one large initial commit, to reflect how the work was actually built up.

## Fixes applied during review

A few real bugs were caught and fixed while verifying this build end-to-end:

- **Security:** password hashes were being returned from `/users/me` and profile-update
  responses. Fixed with a schema-level `toJSON` transform so this can't leak from any endpoint,
  now or in the future.
- **Crash:** the frontend API client tried to `.json()`-parse empty response bodies (e.g. on
  `DELETE`), which threw. Fixed to only parse when there's actually a body.
- **Broken login state:** the register page wrote the auth token directly to `localStorage`
  instead of going through the app's auth context, so the app didn't recognize you as logged in
  immediately after registering. Fixed to use the shared `login()` function.
- **Crash on task edit:** Next.js 16 made route `params` a `Promise`; the edit page was still
  reading it synchronously. Fixed to `await` it.
- **Build fragility:** the app depended on fetching Google Fonts at build time, which fails in
  any offline or network-restricted environment (a real risk on some CI/deployment setups).
  Replaced with system font stacks.
- **Missing feature:** the backend already supported soft-delete/restore, but there was no
  frontend page for it. Added a Trash page.
- **Missing feature:** theme was previously CSS-only (`prefers-color-scheme`), no toggle or
  persistence, which the assessment explicitly asks for. Added a persisted toggle.
