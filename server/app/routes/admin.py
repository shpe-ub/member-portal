"""Admin-only actions.

Endpoint #11 — PATCH /api/members/<id>/role

This is the ONLY file allowed to use the service-role Supabase client
(see app/supabase_client.py). It bypasses row-level security, so be careful.
"""

from flask import Blueprint

bp = Blueprint("admin", __name__)


# =============================================================================
# #11 PATCH /api/members/<id>/role                          Owner: ____________
# =============================================================================
# What it does:
#   An admin promotes another member to admin, or demotes them back to member.
#
# Auth: signed in (@require_auth), AND the caller's role must be "admin".
#
# Request body:
#   {"role": "admin"} or {"role": "member"}
#
# Responses:
#   200  {"id": "<target id>", "role": "<new role>"}
#   400  role missing or not "member"/"admin", or the admin is trying to
#        change their OWN role
#   403  the caller is not an admin
#   404  no member with that id
#
# Database:
#   - The caller's role is in `member_private`.
#   - The target's role is also in `member_private`.
#   - A database trigger also blocks non-admins from changing roles. Your
#     admin check is a second layer of protection, not the only one.
#
# Think about:
#   - Which check comes first: "is the caller an admin?" or "is the body valid?"
#     What does a non-admin learn from the error if you get the order wrong?
#   - Should you look up the caller's role with the user's client or the
#     service-role client? Why?
#   - Tests: SPEC section 7 says a regular user must not be able to change
#     anyone's role. How will you prove that?
