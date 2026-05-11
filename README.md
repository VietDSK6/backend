# VolunConnect Backend API

Volunteer Management & Gamification platform backend built with **Node.js**, **Express**, **TypeScript**, and **Prisma**.

## Tech Stack

| Layer          | Technology                     |
| -------------- | ------------------------------ |
| Runtime        | Node.js + TypeScript (ES2020)  |
| Framework      | Express 4                      |
| ORM            | Prisma 6                       |
| Database       | PostgreSQL 16                  |
| Auth           | JWT (access + refresh tokens)  |
| Validation     | Zod                            |
| File Upload    | Multer + Cloudinary            |
| API Docs       | Swagger UI (swagger-jsdoc)     |
| Security       | Helmet, CORS, bcryptjs         |
| Export         | ExcelJS                        |

## Prerequisites

- **Node.js** >= 18
- **Docker** (for PostgreSQL) or a local PostgreSQL 16 instance
- **npm**

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the database

```bash
docker compose up -d
```

This spins up PostgreSQL on port **5433** with the credentials defined in `docker-compose.yml`.

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` as needed. Key variables:

| Variable                  | Description                       | Default                          |
| ------------------------- | --------------------------------- | -------------------------------- |
| `DATABASE_URL`            | PostgreSQL connection string      | `postgresql://volunconnect:volunconnect123@127.0.0.1:5433/volunconnect` |
| `JWT_SECRET`              | Access token signing secret       | —                                |
| `JWT_REFRESH_SECRET`      | Refresh token signing secret      | —                                |
| `CLOUDINARY_CLOUD_NAME`   | Cloudinary cloud name             | —                                |
| `CLOUDINARY_API_KEY`      | Cloudinary API key                | —                                |
| `CLOUDINARY_API_SECRET`   | Cloudinary API secret             | —                                |
| `PORT`                    | Server port                       | `4000`                           |
| `NODE_ENV`                | Environment                       | `development`                    |

### 4. Run migrations & seed

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 5. Start the dev server

```bash
npm run dev
```

The server starts at `http://localhost:4000`.

## Available Scripts

| Script               | Description                            |
| -------------------- | -------------------------------------- |
| `npm run dev`        | Start dev server with hot-reload (tsx) |
| `npm run build`      | Compile TypeScript to `dist/`          |
| `npm start`          | Run compiled production build          |
| `npm run prisma:generate` | Generate Prisma client            |
| `npm run prisma:migrate`  | Run database migrations            |
| `npm run prisma:seed`     | Seed the database                  |
| `npm run prisma:studio`   | Open Prisma Studio GUI             |

## Project Structure

```
backend/
├── prisma/
│   ├── migrations/        # Database migration history
│   ├── schema.prisma      # Data model definition
│   └── seed.ts            # Database seeder
├── src/
│   ├── app.ts             # Express app entry point
│   ├── config/
│   │   ├── cloudinary.ts  # Cloudinary SDK setup
│   │   ├── database.ts    # Prisma client singleton
│   │   ├── swagger.ts     # Swagger/OpenAPI spec
│   │   └── upload.ts      # Multer upload config
│   ├── middlewares/
│   │   ├── auth.middleware.ts      # JWT authentication guard
│   │   ├── error.middleware.ts     # Global error handler
│   │   ├── role.middleware.ts      # Role-based access control
│   │   └── validate.middleware.ts  # Zod request validation
│   ├── modules/
│   │   ├── auth/           # Register, login, refresh, logout
│   │   ├── users/          # User profile & management
│   │   ├── events/         # Event CRUD
│   │   ├── applications/   # Volunteer applications
│   │   ├── reviews/        # Post-event reviews & ratings
│   │   ├── notifications/  # User notifications
│   │   └── dashboard/      # Admin dashboard stats
│   ├── services/
│   │   ├── badge.service.ts   # Gamification badge logic
│   │   ├── email.service.ts   # Email notifications
│   │   └── export.service.ts  # Excel export
│   ├── types/
│   │   └── express.d.ts    # Express type augmentation
│   └── utils/
│       ├── app-error.ts    # Custom error class
│       ├── bcrypt.ts       # Password hashing helpers
│       ├── jwt.ts          # Token sign/verify helpers
│       ├── pagination.ts   # Pagination utility
│       ├── response.ts     # Standardised API response
│       └── upload.ts       # Cloudinary upload helper
├── docker-compose.yml
├── tsconfig.json
├── package.json
└── .env.example
```

## API Routes

Base URL: `/api/v1`

| Method | Endpoint                   | Module         | Description                  |
| ------ | -------------------------- | -------------- | ---------------------------- |
| POST   | `/auth/register`           | Auth           | Create a new account         |
| POST   | `/auth/login`              | Auth           | Login & receive tokens       |
| POST   | `/auth/refresh`            | Auth           | Refresh access token         |
| POST   | `/auth/logout`             | Auth           | Revoke refresh token         |
| GET    | `/users`                   | Users          | List users                   |
| GET    | `/users/:id`               | Users          | Get user profile             |
| PATCH  | `/users/:id`               | Users          | Update user profile          |
| GET    | `/events`                  | Events         | List events                  |
| POST   | `/events`                  | Events         | Create event (Admin)         |
| GET    | `/events/:id`              | Events         | Get event details            |
| PATCH  | `/events/:id`              | Events         | Update event (Admin)         |
| DELETE | `/events/:id`              | Events         | Delete event (Admin)         |
| GET    | `/applications`            | Applications   | List applications            |
| POST   | `/applications`            | Applications   | Apply for an event           |
| PATCH  | `/applications/:id`        | Applications   | Update application status    |
| GET    | `/reviews`                 | Reviews        | List reviews                 |
| POST   | `/reviews`                 | Reviews        | Submit a review (Admin)      |
| GET    | `/notifications`           | Notifications  | List user notifications      |
| PATCH  | `/notifications/:id/read`  | Notifications  | Mark as read                 |
| GET    | `/dashboard`               | Dashboard      | Admin dashboard stats        |

> Full interactive docs available at `http://localhost:4000/api-docs` when the server is running.

## Database Schema

The app uses the following core models (see `prisma/schema.prisma` for full definitions):

- **User** — Accounts with `STUDENT` or `ADMIN` roles, reputation scores, and volunteer hours.
- **RefreshToken** — Database-stored JWT refresh tokens (cascade-deleted with user).
- **Event** — Volunteer events with status lifecycle (`UPCOMING → ONGOING → COMPLETED / CANCELLED`).
- **Application** — Student-to-event registrations (`PENDING → APPROVED / REJECTED → COMPLETED`).
- **Review** — Admin-submitted post-event ratings (1–5) and feedback.
- **Badge / UserBadge** — Gamification badges awarded based on accumulated volunteer hours.
- **Notification** — In-app notifications for application and review updates.

## Health Check

```
GET /health
→ { "status": "ok", "timestamp": "..." }
```

## License

Private — all rights reserved.
