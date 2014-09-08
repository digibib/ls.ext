##########
# MYSQL
##########
mysql:
  service:
    - dead

mysql_docker_image:
  docker.pulled:
    - name: mysql

koha_mysql_container_stop_if_old:
  cmd.run:
    - name: docker stop koha_mysql_container # Next line baffling? http://jinja.pocoo.org/docs/dev/templates/#escaping - Note: egrep-expression must yield single line
    - unless: docker inspect --format "{{ '{{' }} .Image {{ '}}' }}" koha_mysql_container | grep $(docker images | egrep "mysql[[:space:]]*5\.6[[:space:]]+" | awk '{ print $3 }')
    - require:
      - docker: mysql_docker_image

koha_mysql_container_remove_if_old:
  cmd.run:
    - name: docker rm koha_mysql_container
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
        "3306/tcp":
            HostIp: "0.0.0.0"
            HostPort: "3306"
    - volumes:
        /var/lib/mysql: /var/lib/mysql
    - require:
      - docker: mysql_docker_image

koha_mysql_container_running:
  docker.running:
    - container: koha_mysql_container
    - port_bindings:
        "3306/tcp":
            HostIp: "0.0.0.0"
            HostPort: "3306"
    - binds:
        /var/lib/mysql: /var/lib/mysql
    - watch:
      - docker: koha_mysql_container_installed
