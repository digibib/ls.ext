##########
# KIBANA DOCKER CONTAINER
##########

elk_docker_image:
  docker.pulled:
    - name: pblittle/docker-logstash

busybox_image:
  docker.pulled:
    - name: busybox
