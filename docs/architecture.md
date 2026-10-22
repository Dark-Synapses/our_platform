# Architecture

One repository, one React frontend, one FastAPI backend, one MongoDB database.
Docker Compose runs the complete local development environment. No AWS services.

## First implemented slice

- React + TypeScript + Vite: homepage, expertise page, development status page.
- Real photographic image assets and the original brand artwork.
- Vite proxies browser requests from `/api` to FastAPI: no browser database access.
- FastAPI: liveness and readiness; readiness checks MongoDB.
- MongoDB: persistent Docker volume; no host port published.
- Health tests, strict TypeScript build, Ruff, and GitHub checks.

React + Vite is a small initial UI foundation, not a final SEO strategy. Review
prerendering or server rendering before the public marketing launch if needed.

## Planned modules (not implemented yet)

| Module | Responsibility |
| --- | --- |
| identity | Public registration; email/password login; Google and Microsoft login; sessions |
| clients | Individual or company client accounts and memberships |
| projects | Project scope, start/end dates, authorised project access |
| updates | Manually published progress reports every two weeks |
| deliverables | File metadata and project deliverables |

Add one module only when implementing its use case. A typical feature starts with
`router.py`, `schemas.py`, `service.py`, and `repository.py`. Omit layers that add
no value; do not introduce base repositories, generic services, or microservices.
HTTP routes handle transport, services handle business rules, repositories handle
database access. Website content stays in `frontend/src/content/`.

## Access rules to preserve

Registration is public, not invitation-based. Registration does not grant access
to any project. Admin assignment and membership checks must protect every project,
update, and file request. Google/Microsoft authentication does not grant an admin
role. New accounts cannot choose privileged roles. No protected API is shipped
until its authorisation is implemented and tested.

Client communication is external: email, WhatsApp, LinkedIn. No embedded chat or
content-management dashboard is included. No automatic emails, scheduled reports,
payments, file-storage vendor, or AI provider is selected by this foundation.

## Local development boundaries

This Compose file is for local development, with reload and loopback-only ports.
The initial MongoDB user is an isolated local development root user. Production
needs a restricted application database user, TLS, credentials, backups, email
delivery, OAuth registrations, and a production build/deployment configuration.
These are not silently configured by this starter.

Future file upload must validate file sizes/types and project access. Local file
storage in a Docker volume can be evaluated without any Amazon account; the
storage approach is still open.
