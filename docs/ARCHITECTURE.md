# CoTeacher Architecture

## Initial architecture direction

CoTeacher will use a modular full-stack web architecture that supports a single-user teacher MVP first and expands to school-level roles later.

### Application layers

- **Web UI:** responsive React/Next.js interface
- **Application layer:** server-side business logic and authenticated API routes
- **Data layer:** PostgreSQL relational database with ORM
- **File layer:** private object/file storage
- **AI layer:** server-side AI gateway/service with scoped context
- **Observability:** structured application and security logging

## Core entities

- User
- TeacherProfile
- School
- Class
- Subject
- Task
- Document
- DocumentTemplate
- AIGeneration
- File
- Notification
- AuditLog
- Subscription

## Security model

Every user-owned resource must be authorized server-side. Resource ownership must be enforced using authenticated identity rather than client-supplied user IDs. AI context must be explicitly selected/scoped and must never cross tenant boundaries.

## Template architecture

Document templates are data/configuration, not hard-coded presentation logic. Templates should support versioning and active/inactive status so requirements can evolve without rewriting the application.

## AI architecture

AI calls must run through a server-side controlled boundary. The application should pass only the minimum required context, validate inputs, apply usage limits, and preserve the user's original content. Generated content is draft content and requires teacher review.

## MVP implementation order

1. Project foundation and tooling
2. Authentication and protected application shell
3. Database schema and migrations
4. Teacher Profile
5. Tasks
6. Documents and private storage abstraction
7. Configurable templates
8. AI Document Assistant
9. AI Lesson Planner
10. Contextual AI Assistant
11. Testing, security hardening, performance, deployment
