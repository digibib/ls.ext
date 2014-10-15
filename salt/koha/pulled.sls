##########
# KOHA DOCKER CONTAINER
##########

koha_docker_image:
  docker.pulled:
    - name: digibib/koha:latest
    - force: True
