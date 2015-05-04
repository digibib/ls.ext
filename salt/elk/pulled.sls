##########
# KIBANA DOCKER CONTAINER
##########

elk_docker_image:
  docker.pulled:
    - name: pblittle/docker-logstash:{{ pillar['elk']['logstash']['image-tag'] }}

nginx_docker_image:
  docker.pulled:
    - name: nginx:{{ pillar['elk']['configserver']['image-tag'] }} # http://nginx.com/blog/deploying-nginx-nginx-plus-docker/

busybox_image:
  docker.pulled:
    - name: busybox:{{ pillar['elk']['busybox']['image-tag'] }}
