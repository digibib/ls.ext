
koha_docker_image:
  docker.pulled:
    - name: digibib/koha-salt-docker

koha_container_stop_if_old:
  cmd.run:
    - name: docker stop koha_container || true # Next line baffling? http://jinja.pocoo.org/docs/dev/templates/#escaping - Note: egrep-expression must yield single line
    - unless: docker inspect --format "{{ '{{' }} .Image {{ '}}' }}" koha_container | grep $(docker images | egrep "digibib/koha-salt-docker[[:space:]]*latest[[:space:]]+" | awk '{ print $3 }')
    - require:
      - docker: mysql_docker_image

koha_container_remove_if_old:
  cmd.run:
    - name: docker rm koha_container || true
    - unless: docker inspect --format "{{ '{{' }} .Image {{ '}}' }}" koha_container | grep $(docker images | egrep "digibib/koha-salt-docker[[:space:]]*latest[[:space:]]+" | awk '{ print $3 }')
    - require:
      - cmd: koha_container_stop_if_old

koha_container_installed:
  docker.installed:
    - name: koha_container
    - image: digibib/koha-salt-docker:latest # Version MUST be in line with the one used in egrep expression above AND cannot be upped on an existing database without figuring out a way to run 'mysql_upgrade'
    - ports:
        "80/tcp":
            HostIp: "0.0.0.0"
            HostPort: "80"
        "8080/tcp":
            HostIp: "0.0.0.0"
            HostPort: "8080"
        "8081/tcp":
            HostIp: "0.0.0.0"
            HostPort: "8081"
    - links:
        koha_mysql_container: db
    - require:
      - docker: koha_docker_image

koha_container_running:
  docker.running:
    - container: koha_container
    - port_bindings:
        "80/tcp":
            HostIp: "0.0.0.0"
            HostPort: "80"
        "8080/tcp":
            HostIp: "0.0.0.0"
            HostPort: "8080"
        "8081/tcp":
            HostIp: "0.0.0.0"
            HostPort: "8081"
    - links:
        koha_mysql_container: db
    - watch:
      - docker: koha_container_installed
