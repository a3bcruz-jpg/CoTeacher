# CoTeacher

**AI-powered administrative copilot for Philippine teachers.**

CoTeacher is designed to reduce repetitive administrative work, documentation, planning, and task management for teachers in the Philippines.

## Product principle

> Enter information once. Reuse it everywhere.

## Current MVP

- Teacher dashboard
- Authentication and protected sessions
- Teacher profile with reusable information
- Task and deadline management
- Document workspace
- Document editing and version history
- Document restore, finalize, and archive workflow
- Configurable document templates
- AI document assistant
- AI lesson planner
- Contextual AI assistant
- AI generation persistence and document linkage
- PDF document export
- Responsive UI

## Engineering foundation

- Next.js / React / TypeScript
- Prisma / PostgreSQL
- Secure user-scoped server APIs
- GitHub Actions CI for typecheck and production build
- Vercel deployment target

## Verification

Every production feature is expected to have:

- Server-side authorization
- Input validation and size limits
- Persistence where required
- Loading and error states
- Responsive behavior
- Typecheck and production build verification

AI generated content is draft assistance and must be reviewed by the teacher before official use or submission. CoTeacher does not invent or hard-code official DepEd requirements as facts.

## Local setup

Copy `.env.example` to `.env.local`, configure the database, authentication secret, and AI provider, then run:

```bash
npm install
npx prisma generate
npm run dev
```

For a production database migration:

```bash
npm run db:deploy
```

