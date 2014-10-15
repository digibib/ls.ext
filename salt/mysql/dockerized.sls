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
mysql_data_volume:
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
    - docker: mysql_data_volume

# mysql_data_volume:
#   cmd.run:
#     - name: docker run --detach --volume=/var/lib/mysql --name=koha_mysql_data busybox echo "mysql data volume created"
#     - unless: docker inspect koha_mysql_data > /dev/null

##########
# MYSQL DOCKER CONTAINER
##########

koha_mysql_container_stop_if_old:
  cmd.run:
    - name: docker stop koha_mysql_container || true # Next line baffling? http://jinja.pocoo.org/docs/dev/templates/#escaping - Note: egrep-expression must yield single line
    - unless: docker inspect --format "{{ '{{' }} .Image {{ '}}' }}" koha_mysql_container | grep $(docker images | egrep "mysql[[:space:]]*5\.6[[:space:]]+" | awk '{ print $3 }')
    - require:
      - docker: mysql_docker_image

koha_mysql_container_remove_if_old:
  cmd.run:
    - name: docker rm koha_mysql_container || true
    - unless: docker inspect --format "{{ '{{' }} .Image {{ '}}' }}" koha_mysql_container | grep $(docker images | egrep "mysql[[:space:]]*5\.6[[:space:]]+" | awk '{ print $3 }')
    - require:
      - cmd: koha_mysql_container_stop_if_old

koha_mysql_container_installed:
  docker.installed:
    - name: koha_mysql_container
    - command: ["mysqld", "--datadir=/var/lib/mysql", "--user=mysql", "--max_allowed_packet=64M", "--wait_timeout=6000", "--bind-address=0.0.0.0"]
    - image: mysql:5.6 # Version MUST be in line with the one used in egrep expression above AND cannot be upped on an existing database without figuring out a way to run 'mysql_upgrade'
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
      - docker: mysql_data_volume
      - docker: koha_mysql_container_installed

