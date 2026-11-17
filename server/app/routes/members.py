"""Member profiles and the directory.

Endpoint #4  — POST  /api/members
Endpoint #5  — GET   /api/members/me
Endpoint #6  — PATCH /api/members/me
Endpoint #7  — PUT   /api/members/me/ethnicities
Endpoint #8  — GET   /api/members
Endpoint #9  — GET   /api/members/<id>
Endpoint #10 — GET   /api/directory/filters

Every endpoint in this file needs a signed-in user. The @require_auth decorator
in app/auth.py handles that and tells you who the user is — read it first.

Response shapes ("member object", "my profile object", "directory card") and the
shared validation rules are in SPEC.md section 5. Full endpoint rules are in section 6.
"""

from flask import Blueprint

bp = Blueprint("members", __name__)


# =============================================================================
# Shared pieces — the #4, #5 and #6 owners should agree on these together
# =============================================================================
# - Validation: #4 and #6 both check profile fields against the same rules
#   (SPEC section 5, "Shared validation for editable fields"). Write it once.
# - Response shape: #4, #5, #6 return the "my profile object"; #9 returns the
#   "member object". The member object must NEVER contain email or role.
# - The list of editable fields is in SPEC section 5. Anything else in a
#   request body is a 400.


# =============================================================================
# #4  POST /api/members                                     Owner: ____________
# =============================================================================
# What it does:
#   Creates the signed-in user's profile. The frontend calls it once, right
#   after Supabase sign-up (/register page, and /profile when setting up).
#
# Request body:
#   Editable profile fields. first_name, last_name and major_id are required.
#   education_level defaults to "undergraduate" when left out.
#
# Responses:
#   201  the my profile object
#   400  required field missing, a field fails validation, or the body has a
#        field that isn't editable (id, email, role, timestamps, anything unknown)
#   409  this user already has a profile
#
# Database:
#   - Inserts one row into `member`. Its id comes from the verified token.
#   - Do NOT insert into `member_private` — a database trigger does that.
#
# Think about:
#   - How will you detect "already has a profile" — check first, or catch the
#     database error from the insert?
#   - major_id must exist in `major`. Where do you check that?


# =============================================================================
# #5  GET /api/members/me                                   Owner: ____________
# =============================================================================
# What it does:
#   Returns the signed-in user's own profile. Used by /home and /profile.
#
# Responses:
#   200  the my profile object, with major, ethnicities and the private block
#        (email, role) joined in
#   404  no profile yet — the frontend uses this to send the user to setup
#
# Database:
#   - `member` for the profile, `major` for the major name,
#     `member_ethnicity` + `ethnicity` for ethnicities, `member_private` for
#     email and role.
#
# Think about:
#   - One query with joins, or several queries? (Look up "embedded resources"
#     in the Supabase/PostgREST docs.)
#   - The database rows won't match the response shape exactly. Where does the
#     reshaping happen, and can #6 and #9 reuse it?


# =============================================================================
# #6  PATCH /api/members/me                                 Owner: ____________
# =============================================================================
# What it does:
#   Updates any subset of the user's editable fields. Only the fields present
#   in the body change.
#
# Request body:
#   One or more editable fields, e.g. {"bio": "...", "education_level": "masters"}
#
# Responses:
#   200  the updated my profile object
#   400  empty body, non-editable field, a required field set to null or "",
#        or any field failing validation
#   404  no profile yet
#
# Database:
#   - Updates the user's own row in `member`. `updated_at` is set by a trigger.
#
# Think about:
#   - How is "first_name missing" (fine in PATCH) different from
#     "first_name": null (not fine)?


# =============================================================================
# #7  PUT /api/members/me/ethnicities                       Owner: ____________
# =============================================================================
# What it does:
#   Replaces the user's whole set of ethnicities.
#
# Request body:
#   {"ethnicity_ids": [1, 3]}   — an empty list clears them
#
# Responses:
#   200  the new set as a list of {"id", "name"}
#   400  ethnicity_ids missing, not a list, contains a non-integer, or
#        contains an id that doesn't exist
#   404  no profile yet
#
# Database:
#   - Remove the user's existing rows in `member_ethnicity`, then add one row
#     per id. Duplicate ids in the list are saved once.
#
# Think about:
#   - Validate everything BEFORE deleting anything. Why does the order matter?
#   - Careful: in Python, True is an int. Is [true] a valid list of ids?


# =============================================================================
# #8  GET /api/members  (the directory)                     Owner: ____________
# =============================================================================
# What it does:
#   The directory list, with search, filters and paging. Used by /directory
#   and by the "Total Members" card on /home.
#
# Query params (all optional; when several are given, a member must match all):
#   q                partial, case-insensitive match on first, last or preferred name
#   major_id         exact major
#   grad_year        exact year
#   education_level  exact level
#   ethnicity_id     members who have that ethnicity
#   limit            page size, default 24, max 100
#   offset           rows to skip, default 0
#
# Responses:
#   200  {"members": [directory card, ...], "total": <count of ALL matches before paging>}
#   400  a numeric param that isn't a number, unknown education_level,
#        negative offset, or limit outside 1–100
#
# Rules:
#   - Sorted by last_name, then first_name.
#   - Search never matches email.
#
# Think about:
#   - How do you get both one page of rows AND the total count?
#   - ethnicity_id lives in a different table. How do you filter on it?
#   - q comes straight from the user. Could special characters break your query?


# =============================================================================
# #9  GET /api/members/<id>                                 Owner: ____________
# =============================================================================
# What it does:
#   One member's public profile, opened from a directory card (/directory/<id>).
#
# Responses:
#   200  the member object (no email, no role!)
#   404  no member with that id, OR the id isn't a valid uuid
#
# Think about:
#   - What does Supabase do if you query with an id like "abc"? Should you
#     check the format yourself first?
#   - How much of #5's work can you reuse?


# =============================================================================
# #10 GET /api/directory/filters                            Owner: ____________
# =============================================================================
# What it does:
#   Options for the directory dropdowns that depend on real data.
#
# Response:
#   200  {"grad_years": [2026, 2027, ...], "ethnicities": [{"id", "name"}, ...]}
#
# Rules:
#   - Only values at least one member actually uses. No duplicates.
#   - grad_years ascending; ethnicities sorted by name.
#   - Members with a blank grad_year add nothing.
#
# Think about:
#   - Is it OK to load every member's grad_year and dedupe in Python for a
#     chapter-sized club? When would that stop being OK?
