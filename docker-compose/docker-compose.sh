#!/bin/bash
cd /vagrant/docker-compose
rm -rf docker-compose.yml
if [ ! -f docker-compose.env ]; then
  echo "Need environment file docker-compose.env!"
  exit 1
fi
source docker-compose.env
envsubst < "docker-compose-template.yml" > "docker-compose.yml"
docker-compose up -d
