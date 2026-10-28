#!/usr/bin/env bash
# Render build script for the Django backend
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate --noinput
python manage.py seed_demo_data || true
python manage.py seed_content || true
