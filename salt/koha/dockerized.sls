##########
# KOHA DOCKER CONTAINER
##########

apache2:
  service.dead

# Check if pulled koha image is newer than running container, if so: stop and delete running koha container
koha_container_stop_if_old:
  cmd.run:
    - name: docker stop koha_container || true # Next line baffling? http://jinja.pocoo.org/docs/dev/templates/#escaping - Note: egrep-expression must yield single line
    - unless: docker inspect --format "{{ '{{' }} .Image {{ '}}' }}" koha_container | grep $(docker images | egrep "digibib/koha[[:space:]]+{{ pillar['koha']['koha-image-tag'] }}[[:space:]]+" | awk '{ print $3 }')
    - require:
      - docker: mysql_docker_image

koha_container_remove_if_old:
  cmd.run:
    - name: docker rm koha_container || true
    - unless: docker inspect --format "{{ '{{' }} .Image {{ '}}' }}" koha_container | grep $(docker images | egrep "digibib/koha[[:space:]]+{{ pillar['koha']['koha-image-tag'] }}[[:space:]]+" | awk '{ print $3 }')
    - require:
      - cmd: koha_container_stop_if_old

koha_container_installed:
  docker.installed:
    - name: koha_container
    - image: digibib/koha:{{ pillar['koha']['koha-image-tag'] }}
    - environment:
      - "KOHA_ADMINPASS": "{{ pillar['koha']['adminpass'] }}"
      - "KOHA_ADMINUSER": "{{ pillar['koha']['adminuser'] }}"
      - "KOHA_INSTANCE": "{{ pillar['koha']['instance'] }}"
    - volumes:
      - /var/migration_workdir
    - ports:
      - "6001/tcp"
      - "8080/tcp"
      - "8081/tcp"
      - "5000/tcp"
    - require:
      - docker: koha_docker_image

/var/migration_workdir:
  file.directory:
    - user: root
    - group: root
    - dir_mode: 755
    - file_mode: 644
    - recurse:
      - user
      - group
      - mode

koha_container_running:
  docker.running:
    - container: koha_container
    - hostname: koha
    - port_bindings:
        "6001/tcp":
            HostIp: "{{ pillar['sip']['server']['binding'] }}"
            HostPort: "{{ pillar['sip']['server']['port'] }}"
        "8080/tcp":
            HostIp: "{{ pillar['koha']['opac']['binding'] }}"
            HostPort: "{{ pillar['koha']['opac']['port'] }}"
        "8081/tcp":
            HostIp: "{{ pillar['koha']['intra']['binding'] }}"
            HostPort: "{{ pillar['koha']['intra']['port'] }}"
        "5000/tcp":
            HostIp: "{{ pillar['koha']['intra']['binding'] }}"
            HostPort: "{{ pillar['koha']['intra']['plack_port'] }}"
    - check_is_running:
      - "koha_mysql_container"
    - binds:
        /var/migration_workdir: 
          bind: /var/migration_workdir
          ro: false
    - links:
        koha_mysql_container: db
    - watch:
      - docker: koha_container_installed
      - docker: koha_mysql_container_running
    - require:
      - file: /var/migration_workdir
