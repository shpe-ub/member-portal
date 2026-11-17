# Endpoint Assignments

Each person owns one endpoint: you design and write the Flask route **and** the Supabase
query behind it. There's no starter code — the route file has a comment block for your
endpoint describing what it must do, which tables it touches, and some questions to think
about. Full rules are in [SPEC.md](SPEC.md) section 6. Use `routes/health.py` as the
example of a finished route.

| # | Endpoint | File | Tables | Depends on | Owner |
| --- | --- | --- | --- | --- | --- |
| 0 | Foundation (`@require_auth`, errors, CORS) | `app/auth.py`, `app/errors.py` | — | — | ✅ done |
| 1 | `GET /api/health` | `routes/health.py` | — | 0 | ✅ done (use as example) |
| 2 | `GET /api/majors` | `routes/lookups.py` | `major` | 0 | |
| 3 | `GET /api/ethnicities` | `routes/lookups.py` | `ethnicity` | 0 | |
| 4 | `POST /api/members` | `routes/members.py` | `member` (insert) | 0, 2 | |
| 5 | `GET /api/members/me` | `routes/members.py` | `member`, `major`, `member_ethnicity`, `ethnicity`, `member_private` | 0 | |
| 6 | `PATCH /api/members/me` | `routes/members.py` | `member` (update) | 5 | |
| 7 | `PUT /api/members/me/ethnicities` | `routes/members.py` | `member_ethnicity`, `ethnicity` | 3, 4 | |
| 8 | `GET /api/members` | `routes/members.py` | `member`, `major`, `member_ethnicity` | 5 | |
| 9 | `GET /api/members/<id>` | `routes/members.py` | same as #5, minus `member_private` | 5 | |
| 10 | `GET /api/directory/filters` | `routes/members.py` | `member`, `member_ethnicity`, `ethnicity` | 8 | |
| 11 | `PATCH /api/members/<id>/role` | `routes/admin.py` | `member_private` | 0 | |

**Suggested order:** 2, 3 and 5 have no blockers — good first picks. 4 and 6 share
the same validation rules, and 4/5/6/9 return similar shapes, so those owners should agree on
shared helpers before writing them. Before starting 2, 3, 7 or 8, read the
"Verify before building" note in SPEC section 4.

## Workflow

1. Put your name in the Owner column (in your first PR).
2. `git checkout -b endpoint-<number>-<short-name>` (e.g. `endpoint-2-majors`).
3. Design before you code: write down the function(s) you'll need, which Supabase calls each
   makes, and the order of your checks. Show it to someone. Then build it under your
   endpoint's comment block (keep the comments or trim them — your call).
4. Tests (SPEC section 7):
   - Add `tests/test_<name>.py` covering success, every error status, and 401 without a token.
   - Tests must not call real Supabase — monkeypatch the function that talks to it, like
     `conftest.py` does for `verify_token`. (Hint: this is easier if your Supabase query
     lives in its own small function.)
5. Run `pytest`, then start the frontend and check the page that uses your endpoint
   (the orange "Not built yet" box should be gone).
6. Open a PR. Someone else reviews it.

## Rules that are easy to forget

- The user's id comes from `g.user_id`. **Never** from the body or URL.
- Use `g.db` (the user's client) so row-level security applies. Only #11 may use `get_service_client()`.
- Errors are always `api_error("short message", status)`. Never return a raw database error.
- A body with a field the endpoint doesn't accept → 400.
- Keep queries in the route file. No services layer yet.

## Which page uses which endpoint

| Page | Endpoints |
| --- | --- |
| `/register` | 2, 4 |
| `/home` | 1, 5, 8 |
| `/directory` | 2, 8, 10 |
| `/directory/<id>` | 9 |
| `/profile` | 2, 3, 4, 5, 6, 7 |
