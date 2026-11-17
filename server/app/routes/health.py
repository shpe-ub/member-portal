"""Endpoint #1 — GET /api/health

This one is finished. Use it as the example of what a route looks like.
"""

from flask import Blueprint, jsonify

bp = Blueprint("health", __name__)


@bp.get("/health")
def health():
    return jsonify({"status": "ok"}), 200
