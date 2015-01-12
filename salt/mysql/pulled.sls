##########
# MYSQL
##########

busybox_docker_image:
  docker.pulled:
    - name: busybox:latest

mysql_docker_image:
  docker.pulled:
    - name: mysql:5.6.21
