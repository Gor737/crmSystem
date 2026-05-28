# Break&Build CRM

Enterprise-grade CRM web application with Next.js 15 frontend, Express.js REST API, PostgreSQL database, JWT authentication, role-based access control, lead management, Kanban board, and Docker deployment support.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | Next.js 15, TypeScript, TailwindCSS, Shadcn-style UI, React Hook Form, Zod, Axios, Zustand, Recharts |
| Backend | Express.js, TypeScript, JWT, bcrypt, Prisma |
| Database | PostgreSQL |
| DevOps | Docker, Docker Compose |

## Project Structure

```
CRM_Project/
├── frontend/          # Next.js 15 App Router
├── backend/           # Express REST API
├── prisma/            # Database schema, migrations, seed
├── docker/            # Dockerfiles
├── docs/              # API & deployment documentation
└── docker-compose.yml
```

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16+ (or Docker)
- npm

### 1. Clone and configure environment

```bash
cp .env.example .env
cp .env backend/.env
cp frontend/.env.local.example frontend/.env.local
```

Edit `.env` with your database URL and JWT secrets. The `backend/.env` must stay in sync (Prisma CLI reads it from the backend folder).

### 2. Start PostgreSQL (Docker)

```bash
docker-compose up postgres -d
```

### 3. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
cd .. && npm install
```

### 4. Database setup

```bash
cd backend
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 5. Run development servers

```bash
# From project root
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api

### Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@crm.com | Password123! | Admin |
| manager@crm.com | Password123! | Manager |
| employee@crm.com | Password123! | Employee |

## Features

- **Authentication**: Register, login, logout, forgot/reset password, JWT + refresh tokens
- **User Management**: CRUD, suspend, role assignment (Admin/Manager/Employee)
- **Lead Management**: Full CRUD, status pipeline, search/filter, pagination, CSV export
- **Kanban Board**: Drag-and-drop lead status updates
- **Dashboard**: Stats cards, Recharts analytics, recent activity
- **Profile**: Avatar upload, profile editing
- **Notifications**: In-app notification system
- **Audit Logs**: Admin activity tracking
- **UI**: Dark/light mode, responsive sidebar layout, toast notifications

## Docker (Full Stack)

```bash
docker-compose up --build
```

## Documentation

- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## Production Deployment

| Service | Platform |
|---------|----------|
| Database | [Neon](https://neon.tech) PostgreSQL |
| Backend API | [Render](https://render.com) (`render.yaml`, root: `backend/`) |
| Frontend | [Vercel](https://vercel.com) (root: `frontend/`) |

**Full guide:** [docs/DEPLOYMENT_PRODUCTION.md](docs/DEPLOYMENT_PRODUCTION.md)

Legacy Railway notes: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## License

MIT
