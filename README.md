# Hospital Management System (HMS)

A functional prototype of a Hospital Management System built with **Next.js (App Router)**, **Prisma ORM**, and **SQLite** (for local development, easily swappable to **MySQL** for production).

## Features
- **Role-Based Access Control**: Separate dashboards and permissions for Admin, Doctor, and Receptionist.
- **Patient Management**: Register new patients, view profiles, and access medical history.
- **Appointment Scheduling**: Book appointments and view schedules in a list view. Prevents double-booking.
- **Medical Records**: Doctors can add diagnoses, prescriptions, and notes per visit.
- **Billing**: Generate and manage invoices (mark as Paid/Unpaid).
- **Dashboard**: High-level statistics and appointment charts (using Recharts).

## Tech Stack
- **Framework**: Next.js 14+ (App Router, Server Components, Server Actions)
- **Styling**: Tailwind CSS, Shadcn UI
- **Database**: SQLite (Local), Prisma ORM
- **Authentication**: NextAuth.js (Credentials Provider)

## Getting Started Locally

### 1. Prerequisites
- Node.js 18+
- npm or yarn

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and add the following:
```env
# Local SQLite database
DATABASE_URL="file:./dev.db"

# NextAuth Configuration
NEXTAUTH_SECRET="your-super-secret-key-that-is-at-least-32-chars-long"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Database Setup & Seeding
Initialize the database and populate it with demo data (Admin, Doctors, Receptionist, Patients, Appointments):
```bash
npx prisma migrate dev --name init
node prisma/seed.js
```

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. You will be redirected to the login page.

### Demo Credentials
Use any of the following to log in (password is `password123` for all):
- **Admin**: `admin@hms.com`
- **Receptionist**: `receptionist@hms.com`
- **Doctor**: `dr.smith@hms.com` or `dr.jane@hms.com`

## Deployment to Vercel

This app is optimized for Vercel deployment.

1. **Database Strategy on Vercel**: 
   Vercel serverless functions cannot use a local SQLite file persistently. You must provision a cloud database (e.g., **Aiven MySQL**, **PlanetScale**, or **Supabase PostgreSQL**).
   
2. **Switching to MySQL for Production**:
   - In `prisma/schema.prisma`, change the `provider` in `datasource db` from `"sqlite"` to `"mysql"`.
   - Update your `.env` with the MySQL connection string.
   - Run `npx prisma migrate dev` locally to sync the schema.
   - Since Prisma v7 is used, ensure you install and use the appropriate driver adapter for your chosen database provider if required, or fallback to the standard Prisma Client connection string approach by setting the URL in `prisma.config.ts`.

3. **Vercel Setup**:
   - Push this repository to GitHub.
   - Import the project into Vercel.
   - Set the `DATABASE_URL` and `NEXTAUTH_SECRET` in the Vercel Environment Variables settings.
   - Deploy!
