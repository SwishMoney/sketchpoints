#!/bin/sh

# This is the command to run on the docker swarm manager
# in order to start the services running on the cluster

docker service create \
  -e "NODE_ENV=production" \
  -e "MONGO_URL=somepass" \
  -e "JWT_SECRET=somesecret" \
  -u "node" \
  -w "/home/app" \
  -p 80:3000 \
  --name "sp-backend-api" \
  -d sketchpoints/sp-backend-api