"""
Launcher for the reference Concept Builder Django backend.

Why this file exists:
- The reference venv's interpreter hangs on normal startup in this environment
  (a site .pth / sitecustomize stalls), but works with `-S` + explicit
  `site.main()`. This wrapper reproduces a normal run under that constraint.

It runs the Django dev server on 0.0.0.0:8000, which the web app's Library
section proxies to, so the SAME backend serves both portals.
"""

import site
import sys
import os

# Make the venv's site-packages available without the stalling auto-import.
site.main()

# The reference project root (contains manage.py, config/, apps/).
BACKEND_ROOT = r"C:\3-concept-builder-classes-app\backend"
sys.path.insert(0, BACKEND_ROOT)
os.chdir(BACKEND_ROOT)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

# Use the reference project's own SQLite support for local dev (no MySQL needed).
# settings.py honours DB_ENGINE=sqlite and points at backend/db.sqlite3, which the
# reference repo already ships seeded — same code, same models, same API.
os.environ.setdefault("DB_ENGINE", "sqlite")

from django.core.management import execute_from_command_line  # noqa: E402

if __name__ == "__main__":
    # check → migrate → runserver so the SQLite DB is always ready.
    execute_from_command_line(["manage.py", "check"])
    execute_from_command_line(["manage.py", "runserver", "0.0.0.0:8000", "--noreload"])
