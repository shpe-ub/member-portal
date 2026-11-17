"""Entry point.

Production (Render):   gunicorn wsgi:app
Local development:     flask --app wsgi run --debug --port 5000
"""

from app import create_app

app = create_app()
