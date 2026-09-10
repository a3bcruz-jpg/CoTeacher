# CoTeacher

**AI-powered administrative copilot for Philippine teachers.**

CoTeacher is being designed to reduce repetitive administrative work, documentation, planning, and task management for public school teachers in the Philippines.

## Product principle

> Enter information once. Reuse it everywhere.

## MVP focus

- Teacher dashboard
- Authentication and authorization
- Teacher profile with reusable information
- Task and deadline management
- Document workspace
- Configurable document templates
- AI document assistant
- AI lesson planner
- Contextual AI assistant

## Current foundation

- Next.js / React / TypeScript application shell
- PostgreSQL data model defined in Prisma
- Environment variable template
- Health endpoint at `/api/health`
- Database migration scripts documented
- Product and architecture specifications in `docs/`
- Next.js 16 dynamic route compatibility fixes

## Development status

**Phase 1: Project foundation — complete**

**Phase 2: Database foundation — schema complete; local migration pending database configuration**

The repository is intentionally being built incrementally. Runtime tests and production deployment checks must be performed in an environment with dependencies installed and a configured database.
