"""App factory: builds the Flask app and registers every blueprint under /api."""

from flask import Flask
from flask_cors import CORS

from .config import Config
from .errors import register_error_handlers
from .routes.admin import bp as admin_bp
from .routes.health import bp as health_bp
from .routes.lookups import bp as lookups_bp
from .routes.members import bp as members_bp


def create_app(config_overrides=None):
    app = Flask(__name__)
    app.config.from_object(Config)
    if config_overrides:
        app.config.update(config_overrides)

    CORS(app, origins=[app.config["FRONTEND_ORIGIN"]])
    register_error_handlers(app)

    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(lookups_bp, url_prefix="/api")
    app.register_blueprint(members_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api")

    return app
