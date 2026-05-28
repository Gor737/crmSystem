# Deployment Guide

## Environment Variables

### Backend (Railway / Render)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NODE_ENV` | `production` |
| `PORT` | `4000` (or platform default) |
| `FRONTEND_URL` | Your Vercel frontend URL |
| `JWT_ACCESS_SECRET` | Strong random secret |
| `JWT_REFRESH_SECRET` | Strong random secret |
| `JWT_ACCESS_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |

### Frontend (Vercel)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://your-api.railway.app/api` |

---

## Database (PostgreSQL)

### Option A: Railway

1. Create a new PostgreSQL database on Railway
2. Copy the `DATABASE_URL` connection string
3. Run migrations from your backend service:

```bash
npx prisma migrate deploy --schema=./prisma/schema.prisma
npx tsx prisma/seed.ts
```

### Option B: Render

1. Create PostgreSQL instance on Render
2. Use Internal Database URL for `DATABASE_URL`
3. Run migrations as above

---

## Backend (Railway)

1. Connect your GitHub repository
2. Set root directory to `backend` (or deploy from monorepo with custom build)
3. Build command: `npm install && npm run build && npx prisma generate --schema=../prisma/schema.prisma`
4. Start command: `npx prisma migrate deploy --schema=../prisma/schema.prisma && node dist/index.js`
5. Add all environment variables
6. Deploy

### Render Web Service

- **Build Command**: `cd backend && npm install && npm run build`
- **Start Command**: `cd backend && npx prisma migrate deploy --schema=../prisma/schema.prisma && npm start`
- **Health Check Path**: `/api/health`

---

## Frontend (Vercel)

1. Import project from GitHub
2. Set **Root Directory** to `frontend`
3. Framework Preset: Next.js
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = your production API URL + `/api`
5. Deploy

### Vercel Build Settings

- Build Command: `npm run build`
- Output Directory: `.next` (default)
- Install Command: `npm install`

---

## Docker Production

```bash
# Set secrets in .env
cp .env.example .env

# Build and run
docker-compose up --build -d

# Run migrations inside backend container
docker exec crm_backend npx prisma migrate deploy --schema=../prisma/schema.prisma
docker exec crm_backend npx tsx ../prisma/seed.ts
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000/api

---

## Post-Deployment Checklist

- [ ] Change JWT secrets from defaults
- [ ] Configure CORS `FRONTEND_URL` to production domain
- [ ] Run database migrations
- [ ] Seed initial admin (or create via register)
- [ ] Configure SMTP for password reset emails
- [ ] Enable HTTPS on all services
- [ ] Set up database backups

---

## CI/CD (Optional)

Example GitHub Actions workflow steps:

1. Run `npm run build` for backend and frontend
2. Run Prisma migrate on staging/production
3. Deploy backend to Railway/Render
4. Deploy frontend to Vercel
