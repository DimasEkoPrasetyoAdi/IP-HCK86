#!/usr/bin/env bash
set -euo pipefail
DB=trip_id
USER=postgres

echo "Dropping $DB (if exists)..."
psql -U "$USER" -c "DROP DATABASE IF EXISTS \"$DB\";" || true
echo "Creating $DB ..."
psql -U "$USER" -c "CREATE DATABASE \"$DB\";"

echo "Running migrations..."
npx sequelize-cli db:migrate

echo "Running seeders..."
npx sequelize-cli db:seed:all

echo "Done. Demo user: demo@example.com / password123"
