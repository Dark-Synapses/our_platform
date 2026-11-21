# Dark Synapses Projects — Phase 1

Patch against the supplied source audit. Adds MongoDB-backed project CRUD (admin) and published-only public API; updates existing Projects V2 UI to fetch published records. No projects are automatically published.

## Apply
From ~/our_platform:
```bash
cp -a backend/app/main.py backend/app/main.py.before-projects
cp -a backend/app/core/indexes.py backend/app/core/indexes.py.before-projects
cp -a frontend/src/pages/ProjectsPage.tsx frontend/src/pages/ProjectsPage.tsx.before-projects
cp -a frontend/src/styles/projects-page.css frontend/src/styles/projects-page.css.before-projects
unzip -o ~/Downloads/ds-projects-phase1.zip -d .
cd frontend && npm run typecheck && npm run build
cd ../backend && python -m compileall -q app
```
Restart backend for router/index changes. MongoDB must be reachable.

## Admin API
Use an authenticated admin session and valid Origin (same origin as site):
- GET /api/v1/admin/projects
- PUT /api/v1/admin/projects/{slug} with JSON ProjectInput
- DELETE /api/v1/admin/projects/{slug}

Public endpoints: GET /api/v1/projects and GET /api/v1/projects/{slug}. Only published projects are exposed.

Example payload (draft, not public):
```json
{"slug":"conan-arabic-legal-ai","title":"CONAN","category":"AI Services","service_categories":["AI Services"],"discipline":"Agentic Legal Intelligence","summary":"Legal intelligence platform for Egyptian law.","challenge":"Curating a domain-specific legal knowledge base.","approach":"Knowledge-grounded legal assistance.","features":["Legal research","Document understanding"],"technologies":["Arabic NLP","Agentic AI"],"status":"draft","featured":true,"display_order":1}
```

Media fields accept safe site-relative paths such as /images/projects/conan.jpg or /media/conan-demo.mp4. Upload/storage handling and visual admin editor are Phase 2; files must already be served by frontend or a configured media service. Preview mode ?preview=1 still shows the original local development sample inventory.
