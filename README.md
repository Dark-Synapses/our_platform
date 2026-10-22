# Dark Synapses — foundation

First runnable development slice of the approved AI and cybersecurity website.
TypeScript frontend, Python API, MongoDB; everything runs in Docker Compose.

## Put this into your existing repository

Extract the archive to a separate folder first. Compare its contents with your
repository before copying; include `.github`, `.gitignore`, and `.env.example`.
Do not overwrite existing work blindly. This archive contains no `.git` directory.

## Start

Prerequisite: Docker Engine/Desktop and the Docker Compose plugin.
From the repository root:

```bash
cp -n .env.example .env
```

Edit `.env` and choose a local MongoDB password. Then:

```bash
docker compose up --build
```

- Website: http://localhost:5173
- API docs: http://localhost:8000/docs
- End-to-end connection status: http://localhost:5173/system

Source changes in `frontend/src` and `backend/app` reload automatically.

Node dependencies are locked in `frontend/package-lock.json`; Python dependencies
are locked in `backend/requirements-lock.txt`. Docker and CI use those locks.

```bash
docker compose logs -f backend
docker compose down
```

Stopping containers preserves the database volume. Do not add `--volumes` unless
you intentionally want to delete the local database.

## Structure

| Path | Purpose |
| --- | --- |
| frontend/src/app | Routes and application entry |
| frontend/src/pages | Page components |
| frontend/src/components | Shared UI |
| frontend/src/content | Editable public copy |
| frontend/src/lib | API helpers |
| frontend/src/styles | Colours and responsive styling |
| frontend/public/images | Original logo artwork and generated hero asset |
| backend/app/core | Settings and database connection |
| backend/app/modules | Features grouped by responsibility |
| backend/tests | Backend tests |
| docs/architecture.md | Implemented scope and planned modules |
| compose.yaml | Local services and health checks |

## Check your changes

```bash
docker compose exec frontend npm run build
docker compose exec backend ruff check .
docker compose exec backend ruff format --check .
docker compose exec backend pytest
```

Keep business logic out of UI and routes. Keep secrets out of Git. Use small
branches and focused commits. Add meaningful tests for new business behaviour,
particularly authentication and project-access boundaries.

## Scope

Implemented: visible homepage, editable expertise content, API/MongoDB readiness,
Docker development setup, tests, CI.

Not implemented yet: signup/login, Google/Microsoft integration, projects,
biweekly updates, uploads, and dashboards. No mock login buttons or pretend live
project data are presented as working features. Implement these in small slices
after the foundation is running locally.
