# Docker Web App with PostgreSQL (hw2)

This extends the single-container Node.js app from [hw1](../hw1) into a multi-container application with Docker Compose.

The home page from hw1 now has:
- a **visit counter**: every page view is written to PostgreSQL and the total is read back;
- a **guestbook**: visitors leave messages through the API, and the latest ones appear on the page.

## Run

```bash
cd hw2
cp .env.example .env      # set a real DB_PASSWORD
docker compose up --build
```

Open http://localhost:8080.

## Endpoints

| Method | Path | What it does |
|---|---|---|
| GET | `/` | Home page. Records a visit (write) and shows the counter and latest messages (read) |
| GET | `/api/messages` | All guestbook messages (read) |
| POST | `/api/messages` | Add a message, body `{"author": "...", "text": "..."}` (write) |
| GET | `/api/stats` | Total visits, total messages, time of last visit (read) |

```bash
curl -X POST localhost:8080/api/messages -H "Content-Type: application/json" \
  -d '{"author":"Aslanbek","text":"Hello from Almaty!"}'
curl localhost:8080/api/messages
curl localhost:8080/api/stats
```

## Check that data persists

```bash
docker compose down      # containers removed, volume kept
docker compose up -d
curl localhost:8080/api/stats   # counts are still there
```

`docker compose down -v` deletes the volume and all data.

## Docker setup

| | |
|---|---|
| Services | `backend` (built from `Dockerfile`, Node.js 22 + Express) and `db` (`postgres:16-alpine`) |
| Network | both on `app-net`; the backend connects to the database by its service name `db` |
| Ports | only the backend is published (`${APP_PORT}:3000`); the database is not exposed |
| Startup order | `backend` waits until `db` passes its `pg_isready` healthcheck |
| Configuration | all settings and credentials come from `.env` |
| Secrets | `.env` is in `.gitignore` and `.dockerignore`; only `.env.example` is committed |
| Persistence | PostgreSQL data is stored in the named volume `db-data` |

### Environment variables

| Variable | Purpose | Example |
|---|---|---|
| `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Database credentials, used by both services | `webapp`, `webapp_user`, `change_me` |
| `APP_NAME` | Title shown on the page | `Docker Web App` |
| `APP_ENV` | Environment label shown on the page | `production` |
| `APP_PORT` | Host port for the app | `8080` |
