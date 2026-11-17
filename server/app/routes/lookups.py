"""Lookup lists for dropdowns. No auth required (the sign-up page needs them).

Endpoint #2 — GET /api/majors
Endpoint #3 — GET /api/ethnicities

Look at routes/health.py for what a finished route looks like.
Full rules are in SPEC.md section 6.
"""

from flask import Blueprint

bp = Blueprint("lookups", __name__)


# =============================================================================
# #2  GET /api/majors                                       Owner: ____________
# =============================================================================
# What it does:
#   Returns every major, for the sign-up and profile dropdowns.
#
# Auth: none. The register page calls this before the user has an account.
#
# Response:
#   200  a list of {"id", "name"} objects
#
# Rules:
#   - Sorted by name, EXCEPT "Undeclared" is always first and "Other" always last.
#
# Database:
#   - Reads the `major` table.
#   - There is no signed-in user here. Which Supabase client in
#     supabase_client.py fits that?
#
# Think about:
#   - Can the database do all of the sorting, or does some happen in Python?
#   - What should happen if the Supabase call fails?


# =============================================================================
# #3  GET /api/ethnicities                                  Owner: ____________
# =============================================================================
# What it does:
#   Returns every ethnicity option, for the profile multi-select.
#
# Auth: none.
#
# Response:
#   200  a list of {"id", "name"} objects, sorted by name
#   200  [] when the table is empty (an empty table is not an error)
#
# Database:
#   - Reads the `ethnicity` table.
#
# Think about:
#   - This is very close to #2. If you and the #2 owner end up writing the same
#     code twice, is it worth sharing? (SPEC: keep it simple, one idea per function.)
