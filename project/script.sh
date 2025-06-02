#!/bin/sh

set -e

echo "⏳ Waiting for Postgres to be ready..."

while ! nc -z postgres 5432; do
  sleep 1
done

echo "✅ Postgres is up. Running migrations..."


npx prisma migrate deploy
npx prisma generate

echo "🚀 Starting NestJS..."

npm run start:dev
