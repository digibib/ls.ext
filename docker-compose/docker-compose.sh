#!/bin/bash
# This shell script replaces variables in docker-compose.yml with ENV vars
# including (vars sourced from file docker-compose.env)
cd /vagrant/docker-compose
rm -rf docker-compose.yml
if [ ! -f docker-compose.env ]; then
  echo "Need environment file docker-compose.env!"
  exit 1
fi
source docker-compose.env
envsubst < "docker-compose-template.yml" > "docker-compose.yml"
docker-compose up -d
