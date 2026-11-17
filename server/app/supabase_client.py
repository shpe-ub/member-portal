"""Creates Supabase clients.

There are two kinds of client:

- get_user_client(token): acts AS the signed-in user. Row-level security (RLS)
  applies, so the database itself blocks reads/writes the user isn't allowed.
  Use this in almost every route.

- get_service_client(): uses the service-role key and BYPASSES RLS.
  Only the admin role endpoint (#11) may use it. Never send this key to the frontend.
"""

from flask import current_app
from supabase import Client, create_client


def get_anon_client() -> Client:
    """A client with no user attached. Fine for public tables like `major`."""
    config = current_app.config
    return create_client(config["SUPABASE_URL"], config["SUPABASE_ANON_KEY"])


def get_user_client(access_token: str) -> Client:
    """A client that sends the user's token, so RLS applies to every query."""
    client = get_anon_client()
    client.postgrest.auth(access_token)
    return client


def get_service_client() -> Client:
    """A client that bypasses RLS. Admin endpoint only."""
    config = current_app.config
    return create_client(config["SUPABASE_URL"], config["SUPABASE_SERVICE_ROLE_KEY"])
