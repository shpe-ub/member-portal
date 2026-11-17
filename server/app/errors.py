"""Error helpers. Every error the API returns looks like {"error": "<short message>"}."""

from flask import jsonify, request
from werkzeug.exceptions import HTTPException


def api_error(message, status):
    """Use this in routes: `return api_error("major_id is required", 400)`."""
    return jsonify({"error": message}), status


def register_error_handlers(app):
    @app.errorhandler(HTTPException)
    def handle_http_error(error):
        # No route matched this URL at all. Usually that means the endpoint
        # hasn't been built yet; the frontend shows "Not built yet" for this.
        if request.url_rule is None and error.code == 404:
            return api_error("route not found", 404)
        # Everything else: 405 wrong method, 400 bad JSON, etc.
        return api_error(error.description or error.name, error.code)

    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        # Log the real error for us, but never send details to the client.
        app.logger.exception(error)
        return api_error("internal server error", 500)
