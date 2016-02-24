#!/bin/bash
# This shell script replaces variables in docker-compose.yml with ENV vars
# including (vars sourced from file docker-compose.env)
cd /vagrant/docker-compose

echo "Provisioning docker-compose.yml template for ${LSDEVMODE} environment..."
case "$LSDEVMODE" in
	'build')
	source docker-compose.env.example
	envsubst < "docker-compose-template-dev-CI.yml" > "docker-compose.yml"
	;;
	'prod')
	if [ ! -f docker-compose.env ]; then
	  echo "Need environment file docker-compose.env!"
	  exit 1
	fi
	source docker-compose.env
	envsubst < "docker-compose-template-prod.yml" > "docker-compose.yml"
	;;
	*)
	source docker-compose.env.example
	source secrets.env
	envsubst < "docker-compose-template-dev.yml" > "docker-compose.yml"
	;;
esac