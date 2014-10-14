##########
# KOHA DOCKER CONTAINER
##########

koha_docker_image:
  docker.pulled:
    - name: digibib/koha-salt-docker:latest
    - force: True
