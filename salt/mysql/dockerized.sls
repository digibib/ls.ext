##########
# MYSQL
##########
mysql:
  service:
    - dead

##########
# MYSQL DATA VOLUME
# - need to run manual command, as docker.installed doesn't actually create container
##########
mysql_data_volume_installed:
  docker.installed:
    - name: koha_mysql_data
    - image: busybox:latest
    - volumes:
      - /var/lib/mysql

mysql_data_volume_run_once:
  docker.running:   
  - container: koha_mysql_data   
  - volumes:  
    - /var/lib/mysql
  - check_is_running: False
  - require:
    - docker: mysql_data_volume_installed

##########
# MYSQL DOCKER CONTAINER
##########

# Check if pulled mysql image is newer than running container, if so: stop and delete running mysql container
koha_mysql_container_stop_if_old:
  cmd.run:
    - name: docker stop koha_mysql_container || true
    - unless: "docker inspect --format \"{{ '{{' }} .Image {{ '}}' }}\" koha_mysql_container | grep $(docker history --quiet --no-trunc mysql:5.6 | head -n 1)"
    - require:
      - docker: mysql_docker_image

koha_mysql_container_remove_if_old:
  cmd.run:
    - name: docker rm koha_mysql_container || true
    - unless: "docker inspect --format \"{{ '{{' }} .Image {{ '}}' }}\" koha_mysql_container | grep $(docker history --quiet --no-trunc mysql:5.6 | head -n 1)"
    - require:
      - cmd: koha_mysql_container_stop_if_old

koha_mysql_container_installed:
  docker.installed:
    - name: koha_mysql_container
    - command: ["mysqld_safe", "--datadir=/var/lib/mysql", "--user=mysql", "--max_allowed_packet=64M", "--wait_timeout=6000", "--bind-address=0.0.0.0", "--log-error=/var/lib/mysql/mysql.err"]
    - image: mysql:5.6 # Version MUST be in line with the one used in koha_mysql_container_stop_if_old
    - environment:
      - "MYSQL_ROOT_PASSWORD": "{{ pillar['koha']['adminpass'] }}"
      - "MYSQL_USER": "{{ pillar['koha']['adminuser'] }}"
      - "MYSQL_PASSWORD": "{{ pillar['koha']['adminpass'] }}"
      - "MYSQL_DATABASE": "koha_{{ pillar['koha']['instance'] }}"
    - ports:
      - "3306/tcp"
    - require:
      - docker: mysql_docker_image

koha_mysql_container_running:
  docker.running:
    - container: koha_mysql_container
    - port_bindings:
        "3306/tcp":
            HostIp: "0.0.0.0"
            HostPort: "3306"
    - volumes_from:
      - "koha_mysql_data"
    - watch:
      - docker: mysql_data_volume_installed
      - docker: mysql_data_volume_run_once
      - docker: koha_mysql_container_installed

