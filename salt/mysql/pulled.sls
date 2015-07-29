##########
# MYSQL
##########

busybox_docker_image:
  docker.pulled:
    - name: busybox
    - tag: latest

mysql_docker_image:
  docker.pulled:
    - name: mysql
    - tag: 5.6.26
