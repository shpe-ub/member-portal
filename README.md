# SHPE UB Member Portal

Members create an account, fill in a profile, and browse a directory of other members.

| Folder | What | Runs on |
| --- | --- | --- |
| `client/` | Next.js frontend (login, register, home, directory, profile) | http://localhost:3000 |
| `server/` | Flask API — every route is under `/api` | http://localhost:5000 |
| `supabase/` | Database schema and seed data | Supabase dashboard |

Want to pick up an endpoint? See [ASSIGNMENTS.md](ASSIGNMENTS.md).

## Setup

You need **Python 3.12** and **Node 20+**.

### Backend

```bash
cd server
python3.12 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env               # then fill in the real values (ask the team lead)

flask --app wsgi run --debug --port 5000
pytest                             # run the tests
```

Check it works: open http://localhost:5000/api/health → `{"status": "ok"}`.

### Frontend

```bash
cd client
npm install
cp .env.example .env.local         # fill in the Supabase URL and anon key
npm run dev
```

Open http://localhost:3000. Without `.env.local` the site runs in **preview mode**: pages
load, but you can't log in.

## How the pieces talk

```
Browser ──(sign up / log in)──────────────► Supabase Auth
   │
   └──(Authorization: Bearer <token>)──► Flask ──(same token, RLS applies)──► Supabase Postgres
```

- The frontend only talks to Supabase for auth. All data goes through Flask.
- Every frontend → backend call is in [client/lib/api.js](client/lib/api.js).
- Endpoints nobody has built yet have no route, so Flask answers `{"error": "route not found"}`
  and the page shows an orange
  "Not built yet" box naming the endpoint. When you build yours, the box goes away.

## Where things live

```
client/
  app/login, app/register        auth pages
  app/(portal)/home              /home
  app/(portal)/directory         /directory and /directory/<id>
  app/(portal)/profile           /profile (also profile setup when you have none)
  app/(portal)/layout.js         sidebar + "must be logged in" check
  components/                    shared pieces (Sidebar, Avatar, ProfileFields, …)
  lib/api.js                     every call to Flask
  lib/supabase.js                Supabase client (auth only)

server/
  app/__init__.py                create_app(): registers blueprints under /api
  app/config.py                  reads .env
  app/auth.py                    @require_auth  → g.user_id, g.db
  app/errors.py                  api_error(), JSON error handlers
  app/supabase_client.py         user client (RLS) and service client (admin only)
  app/routes/*.py                one file per feature — this is where you work
  tests/                         pytest; Supabase is faked, no network needed
```
