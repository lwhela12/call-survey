# Survey Runtime Template - Usage Guide

This template is used to create deployable survey applications from Nesolagus Studio exports.

## Architecture

```
Studio (Private) → Exports Survey → Deployable App (This Template)
                                            ↓
                                   Railway PostgreSQL
```

Each exported survey becomes a standalone Next.js application that includes:
- Survey delivery UI
- Dashboard for viewing responses
- Runtime API for survey sessions
- Connection to shared Railway database

## Template Structure

```
survey-runtime/
├── app/                          # Next.js App Router
│   ├── survey/page.tsx          # Survey delivery page
│   ├── dashboard/page.tsx       # Response dashboard
│   ├── api/runtime/             # Runtime API routes
│   │   ├── start/               # Start survey session
│   │   └── sessions/            # Session management
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home (redirects to survey)
├── config/                       # Exported configuration (populated during export)
│   ├── survey.json              # Survey definition (generated)
│   ├── dashboard.json           # Dashboard config (generated)
│   └── theme.json               # Theme configuration (generated)
├── lib/                          # Utilities
│   ├── config.ts                # Config loaders
│   ├── db.ts                    # Prisma client
│   └── runtime-api.ts           # Runtime API client
├── prisma/
│   └── schema.prisma            # Database schema
├── server/
│   └── runtime/
│       └── runtime-engine.ts    # Survey runtime engine
├── public/
│   └── assets/                  # Bundled survey assets
├── package.json
├── .env.example
├── vercel.json                  # Vercel deployment config
├── railway.json                 # Railway deployment config
└── README.md
```

## How Studio Exports Work

Studio now bundles this template automatically. When you download an export (or run the CLI), the resulting zip is already a complete Next.js application containing:

- `config/survey.json`, `config/theme.json`, and `config/dashboard.json` (when available).
- `data/seed-data.json` with optional sample responses for dashboard seeding.
- `public/assets/` with every referenced asset renamed safely for serving.
- `.env.example` populated with draft/client identifiers (replace with real environment values).
- `metadata/manifest.json` describing bundle metadata and asset checksums.
- The full runtime template (`app/`, `lib/`, `prisma/`, `scripts/`, etc.).
- `vendor/<package>/` directories that embed compiled `@nesolagus/*` packages; `package.json` already points at these file dependencies.

### Generating a bundle

**Publish screen**
1. Navigate to `/editor/[draftId]/publish`.
2. Resolve readiness checklist items (validation issues, missing assets, dashboard config).
3. Choose an environment label (e.g. `production`) and select **Download export bundle**.

**CLI**

```bash
npm run export -- --draft dra_xxxxx --env production --out ./exports --extract
```

- `--extract` creates a directory with the files already unzipped.
- Run `npm run export -- --help` for additional flags.

### After download

```bash
unzip <bundle>.zip -d ./deployments
cd ./deployments/<bundle>
npm install
cp .env.example .env   # replace DATABASE_URL, CLIENT_ID, DEPLOYMENT_ID, etc.
npm run dev
```

Open http://localhost:3000 to test the exported survey (`/survey`) and dashboard (`/dashboard`). Once verified, deploy using your preferred hosting workflow.

## Deployment Process

### Prerequisites

1. **Railway PostgreSQL Database** (one shared database for all surveys)
   - Create once, reuse for all survey apps
   - Run migrations: `npx prisma migrate deploy`

2. **Environment Variables**
   - `DATABASE_URL` - Railway PostgreSQL connection string
   - `CLIENT_ID` - From Studio export (also in `metadata/manifest.json`)
   - `DEPLOYMENT_ID` - From Studio export (also in `metadata/manifest.json`)

### Deploy to Vercel

```bash
# 1. Prepare the app
npm install
npx prisma generate

# 2. Deploy
vercel --prod

# 3. Add environment variables in Vercel dashboard
#    - DATABASE_URL
#    - CLIENT_ID
#    - DEPLOYMENT_ID
```

### Deploy to Railway

```bash
# Railway will use railway.json configuration
# Just connect the repo and add environment variables
```

## Database Schema

The template includes a simplified Prisma schema with only runtime models:

- `SurveyResponse` - Completed survey sessions
- `SurveyAnswer` - Individual question answers

These connect to the same Railway database used by Studio, which also contains:
- `Client` - Tenant/organization
- `Draft` - Survey configurations
- `Deployment` - Published surveys
- `Asset` - Uploaded media

## Customization

### Branding

Edit `app/layout.tsx` to customize:
- Page title
- Meta tags
- Favicon

### Theme

Theme is automatically exported from Studio in `config/theme.json`.

### Routes

- `/survey` - Main survey interface
- `/dashboard` - Response analytics (requires authentication in production)
- `/api/runtime/*` - Backend APIs (used by survey UI)

## Security Considerations

**Important:** The template does not include authentication for the dashboard.

For production deployments:
1. Add authentication middleware (e.g., NextAuth.js)
2. Protect `/dashboard` route
3. Add API route protection
4. Use environment-specific secrets

## Troubleshooting

### "Module not found: @nesolagus/..."

The template depends on shared packages from the monorepo. Options:
1. Publish packages to npm
2. Use npm workspaces
3. Bundle packages into the export

### "DATABASE_URL not found"

Ensure `.env` file exists with valid Railway connection string.

### Assets not loading

Check that assets are in `public/assets/` and paths match manifest.

## Development

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Support

For questions about the template or exports, see:
- Main docs: `/docs/ONE-CLICK-DEPLOYMENT.md`
- Studio roadmap: `/Complete-Studio-Roadmap.md`
