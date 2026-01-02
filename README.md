# WordProblem Coach

**10-minute daily, tool-verified, Socratic micro-tutoring for Grades 5-8 Common Core math word problems with weekly parent reports.**

## Features

- **Socratic AI Coaching**: Our AI coach asks guiding questions, never gives away answers
- **Tool-Verified Answers**: Math.js powered verification for precise feedback
- **4-Step Problem Solving**: Read → Represent → Solve → Check framework
- **Weekly Progress Reports**: Detailed reports by Common Core standard
- **Multi-Child Support**: Pro plans support multiple child profiles
- **Kid-Safe PIN Access**: Children can practice independently with a simple PIN

## Tech Stack

- **Framework**: Next.js 14.2 (App Router) + React 18.3 + TypeScript 5.5
- **Styling**: Tailwind CSS 3.4 + shadcn/ui + Radix UI
- **Database**: Supabase Postgres 15 with Row Level Security
- **Payments**: Stripe subscriptions
- **AI**: OpenAI API (Responses API)
- **Math Verification**: mathjs 13.x
- **Email**: Resend
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20.x
- npm or yarn
- Supabase account
- Stripe account
- OpenAI API key
- Resend account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-tutor-kids.git
cd ai-tutor-kids
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment file and fill in your values:
```bash
cp .env.example .env.local
```

4. Set up your Supabase database:
   - Create a new Supabase project
   - Run the migration in `supabase/migrations/0001_init.sql`
   - Seed the database: `npm run seed`

5. Configure Stripe:
   - Create products and prices for Pro and Pro+ plans
   - Add the price IDs to your environment variables
   - Set up the webhook endpoint: `/api/stripe/webhook`

6. Start the development server:
```bash
npm run dev
```

### Environment Variables

```
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_CRON_SECRET=change-me

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=
NEXT_PUBLIC_STRIPE_PRO_PLUS_PRICE_ID=

# OpenAI
OPENAI_API_KEY=
OPENAI_MODEL_COACH=gpt-4o-mini
OPENAI_MODEL_EDGE=gpt-4o

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL="WordProblem Coach <reports@yourdomain.com>"

# Kid auth token signing
KID_TOKEN_JWT_SECRET=change-me-long-random
```

## Deployment

### Deploy to Vercel

1. Initialize git and create repository:
```bash
git init
gh repo create ai-tutor-kids --public --source=. --remote=origin
```

2. Commit and push:
```bash
git add .
git commit -m "Initial build"
git push -u origin main
```

3. Deploy to Vercel:
```bash
npx vercel --yes
npx vercel --prod
```

The app will be live at: https://ai-tutor-kids.vercel.app

### Stripe Webhook Setup

1. In Stripe Dashboard, create a webhook endpoint pointing to:
   `https://your-domain.com/api/stripe/webhook`

2. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

3. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### Cron Jobs

Weekly reports are triggered via Vercel Cron. The configuration in `vercel.json` schedules the job for every Monday at 8 AM UTC.

## Project Structure

```
ai-tutor-kids/
├── app/                    # Next.js App Router pages
│   ├── (marketing)/        # Public marketing pages
│   ├── (auth)/             # Authentication pages
│   ├── (parent)/           # Parent dashboard pages
│   ├── (kid)/              # Kid practice pages
│   └── api/                # API routes
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   ├── Kid/                # Kid-facing components
│   └── Parent/             # Parent-facing components
├── lib/                    # Utility functions and services
│   ├── supabase/           # Supabase clients
│   ├── stripe/             # Stripe utilities
│   ├── ai/                 # OpenAI integration
│   ├── verify/             # Math verification
│   ├── session/            # Session management
│   └── reports/            # Report generation
├── supabase/               # Database migrations and seeds
└── emails/                 # Email templates
```

## Plans & Pricing

| Feature | Free | Pro ($9.99/mo) | Pro+ ($19.99/mo) |
|---------|------|----------------|------------------|
| Child profiles | 1 | 3 | 10 |
| Daily sessions | 1 | Unlimited | Unlimited |
| Problems/session | 3 | 8 | 15 |
| Progress tracking | Basic | Full | Full |
| Weekly reports | - | Email | Email |
| Standards breakdown | - | Yes | Yes |
| Custom goals | - | - | Yes |

## License

MIT
