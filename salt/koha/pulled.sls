##########
# KOHA DOCKER CONTAINER
##########

koha_docker_image:
  docker.pulled:
    - name: digibib/koha:{{ pillar['koha']['koha-image-tag'] }}
    - force: True
