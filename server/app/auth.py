"""The @require_auth decorator.

Put it on any route that needs a signed-in user:

    @bp.get("/members/me")
    @require_auth
    def get_my_profile():
        user_id = g.user_id      # the verified user's id (a uuid string)
        db = g.db                # Supabase client that sends the user's token
        ...

Never take the user's id from the request body or URL. Always use g.user_id.
"""

from functools import wraps

from flask import g, request

from .errors import api_error
from .supabase_client import get_anon_client, get_user_client


def read_bearer_token():
    """Returns the token from 'Authorization: Bearer <token>', or None."""
    header = request.headers.get("Authorization", "")
    parts = header.split(" ")
    if len(parts) != 2 or parts[0] != "Bearer" or not parts[1]:
        return None
    return parts[1]


def verify_token(token):
    """Asks Supabase who owns this token. Returns the user id, or None if invalid."""
    try:
        response = get_anon_client().auth.get_user(token)
    except Exception:
        return None
    if response is None or response.user is None:
        return None
    return response.user.id


def require_auth(route_function):
    @wraps(route_function)
    def wrapper(*args, **kwargs):
        token = read_bearer_token()
        if token is None:
            return api_error("missing or malformed Authorization header", 401)

        user_id = verify_token(token)
        if user_id is None:
            return api_error("invalid or expired token", 401)

        g.user_id = user_id
        g.access_token = token
        g.db = get_user_client(token)
        return route_function(*args, **kwargs)

    return wrapper
