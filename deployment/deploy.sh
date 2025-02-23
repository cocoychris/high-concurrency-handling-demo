#!/bin/bash
# Load the environment variables
source ./version.env
source ./set-permission.sh

# Pull and run the docker compose
docker compose --env-file ./.env --env-file ./version.env pull
docker compose --env-file ./.env --env-file ./version.env up -d
docker exec -u root -it $APP_NAME bash deployment/set-permission.sh
docker exec -u root -it $APP_NAME tsx scripts/drizzle-migrate.ts
docker logs -f -n 100 $APP_NAME
