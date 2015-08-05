##########
# KOHA DOCKER CONTAINER
##########

koha_docker_image:
  docker.pulled:
    - name: digibib/koha
    - tag: {{ pillar['koha']['koha-image-tag'] }}
