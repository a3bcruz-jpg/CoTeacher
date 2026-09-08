# CoTeacher Database Design

The initial schema lives in `prisma/schema.prisma` and uses PostgreSQL.

## Ownership model

User-owned resources use `userId` and must always be authorized server-side from the authenticated session. Client-supplied user IDs must never determine ownership.

## Core relationships

- `User` has one `TeacherProfile`.
- `TeacherProfile` may belong to a `School` and own multiple `Class` records.
- `Class` can contain multiple `Subject` records.
- `User` owns `Task`, `Document`, `StoredFile`, `Notification`, `AIGeneration`, and audit records.
- `Document` can reference a versioned `DocumentTemplate`.
- `Document` keeps immutable `DocumentVersion` snapshots for history.
- `Document` may have related private files and AI generations.
- `Subscription` is one-to-one with a user to support future SaaS plans.

## Privacy rules

1. Never expose database records directly from a route without authorization.
2. Query user-owned resources with authenticated identity in the server-side query.
3. Do not use a URL/body `userId` as the security boundary.
4. Keep file storage private and resolve access through authorized application routes.
5. Pass only explicitly selected content to AI services.
6. Do not retain unnecessary student personally identifiable information.

## Template rules

Templates are data rather than hard-coded UI. `version`, `status`, `schema`, and `instructions` allow requirements to evolve without rewriting application logic.

## Migration workflow

After installing dependencies and configuring `DATABASE_URL`:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

Production deployments should use:

```bash
npx prisma migrate deploy
```

Do not commit `.env` or real credentials.
