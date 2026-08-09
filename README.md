# AbleSpace Task Manager

A full-stack task management system built for the **AbleSpace Full Stack Developer assessment**. The application provides authenticated task and project management with Board/List views, task details, filtering, search, themes, responsive layouts, and a NestJS + MongoDB backend.

## Live Links

- **Frontend (Vercel):** https://ablespace-task-manager-beta.vercel.app/
- **Backend API (Render):** https://ablespace-task-manager.onrender.com
- **GitHub Repository:** https://github.com/Abhishek180-Kumar/ablespace-task-manager

> **Note on cold start:** The backend is hosted on Render's free tier. After a period of inactivity, the first request may take longer while the server wakes up. Subsequent requests are normally faster. This is a hosting-tier limitation rather than an application error.

## Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend:** NestJS, TypeScript
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT-based authentication with Guest Login support
- **Icons:** Lucide
- **Deployment:** Vercel (frontend) and Render (backend)

## Features

### Authentication

- Email/password registration and login
- Guest Login for quick product evaluation
- Protected application routes
- JWT-based authentication
- Automatic handling of unauthorized/expired sessions
- Logout

### Task Management

- Create, view, edit, and delete tasks
- Soft-delete/trash and restore support
- Task status management
- Priority management
- Task detail page with properties panel
- Due dates with a custom date picker
- Subtasks
- Task resources/links
- Task comments/updates
- Task action menu
- Search with debounced input
- Status and priority filtering
- Extensible filter menu for additional task properties

### Views

- List/Table view
- Board/Kanban view
- Drag-and-drop task status management
- Synchronized task data between views
- Responsive desktop, tablet, and mobile layouts

### Projects

- Project listing
- Project detail view
- Project creation and editing
- Project priority
- Project status
- Project lead
- Project due date

### Profile & Appearance

- User profile page
- Profile information display/editing where supported
- Light and Dark themes
- Persistent theme preference
- Accent color modes:
  - Amber
  - Blue
  - Pink
  - Rose
  - Emerald
  - Black
- Settings and appearance controls
- Responsive mobile navigation/sidebar

### Engineering & Quality

- Reusable React components
- Centralized frontend API handling
- Backend DTO validation with `class-validator`
- JWT authentication guards
- User-scoped task/project access
- Environment-based CORS configuration
- MongoDB indexes for commonly queried task/project fields
- Responsive UI
- Accessible interactive controls
- Production build and lint checks

## Project Structure

```text
ablespace-task-manager/
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── auth/               # JWT authentication, guest login, guards
│   │   ├── tasks/              # Task CRUD and task services
│   │   ├── projects/           # Project functionality
│   │   └── users/              # User schema, profile and services
│   └── .env.example
│
├── frontend/                   # Next.js application
│   ├── app/                    # App Router pages and routes
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── register/
│   │   ├── tasks/
│   │   ├── projects/
│   │   ├── profile/
│   │   └── settings/
│   ├── components/             # Reusable UI components
│   └── lib/                    # API client, auth and theme utilities
│
├── AbleSpace_Part2_Walkthrough.docx
└── README.md
```

## Running Locally

### Prerequisites

- Node.js and npm
- MongoDB database
- Git

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run start:dev
```

Configure the required values in `backend/.env`, including the MongoDB connection string and JWT secret.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend normally runs on `http://localhost:3000`. The backend port is determined by the backend environment configuration.

The frontend must be configured with the deployed/local backend API URL through the project's environment variable configuration.

## Environment Variables

### Backend

Typical production configuration includes:

```text
MONGODB_URI=<MongoDB connection string>
JWT_SECRET=<secure JWT secret>
JWT_EXPIRES_IN=<token expiry>
CORS_ORIGIN=https://ablespace-task-manager-beta.vercel.app
PORT=<configured Render port>
```

### Frontend

```text
NEXT_PUBLIC_API_URL=<Render backend URL>
```

Google OAuth, if enabled, also requires the corresponding OAuth provider configuration and frontend/backend environment variables used by the application.

**Never commit real secrets, database credentials, JWT secrets, or OAuth credentials to the repository.**

## Design Fidelity

The implementation follows the supplied AbleSpace Figma assessment design:

https://www.figma.com/design/obONCFmoTFN27V5H9PHS2X/Assessment-Task

The implementation covers the major reference states including:

- Authentication screen
- Workspace/sidebar navigation
- Tasks Board view
- Tasks List view
- Search and filter controls
- Task action menu
- Task detail and properties panel
- Subtasks
- Resources
- Comments/updates
- Projects
- Profile
- Settings
- Theme and accent color controls
- Responsive layouts

There are **no intentional product or interaction deviations** from the assessment requirements. Minor visual differences may occur due to browser rendering, available icon/font assets, and the runtime environment.

## Part 2 — Product Understanding

The repository includes:

`AbleSpace_Part2_Walkthrough.docx`

The document covers the AbleSpace **Caseload → Take Data** workflow, screenshots, product understanding, and suggested UX/UI improvements as required by Part 2 of the assessment.

## Deployment

The application is deployed as two services:

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB

For production deployments, make sure the frontend `NEXT_PUBLIC_API_URL` points to the Render backend and the backend `CORS_ORIGIN` allows the deployed Vercel frontend origin.

After changes are pushed to the configured Git branch, the connected deployment services can build and deploy the latest version automatically.

## Assessment Notes

This project was developed specifically for the AbleSpace Full Stack Developer assessment. The implementation focuses on:

- Figma-oriented UI fidelity
- Full-stack architecture
- Reusable components
- REST API integration
- Authentication and authorization
- Database persistence
- Responsive design
- Input validation
- Maintainability
- Production deployment

AI-assisted development tools may have been used during implementation; all submitted functionality should remain understandable and explainable during the technical evaluation/interview.

## Author

**Abhishek Kumar**

GitHub: https://github.com/Abhishek180-Kumar
