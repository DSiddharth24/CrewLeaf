# FestPilot 🚀

Production-ready Event Management SaaS for College Clubs.

## Tech Stack
- **Frontend**: Next.js 15 (App Router), Tailwind CSS, Lucide React
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Payments**: Stripe Checkout (INR)
- **Auth**: Custom JWT-based Auth (bcrypt + jose)
- **PDF**: @react-pdf/renderer

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file with:
   ```env
   DATABASE_URL="postgresql://user:pass@host:5432/db"
   JWT_SECRET_KEY="your-secret-key"
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   APP_BASE_URL="http://localhost:3000"
   ```

3. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Key Features
- **Club Dashboard**: Manage events, track registrations and revenue.
- **Real Payments**: Secure Stripe flow in INR.
- **Sponsor Tracking**: Financial management for event budgets.
- **Smart Certificates**: Auto-generate PDFs and verify them via public links.
- **CSV Export**: One-click download of participant data.
