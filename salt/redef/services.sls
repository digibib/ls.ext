
redef_services_container_stop_if_old:
  cmd.run:
    - name: docker stop redef_services_container || true # Next line baffling? http://jinja.pocoo.org/docs/dev/templates/#escaping - Note: egrep-expression must yield single line
    - unless: docker inspect --format "{{ '{{' }} .Image {{ '}}' }}" redef_services_container | grep $(docker images | egrep "digibib/redef-services[[:space:]]+{{ pillar['redef']['image-tag'] }}[[:space:]]+" | awk '{ print $3 }')
    - require:
      - docker: redef_services_docker_image

redef_services_container_remove_if_old:
  cmd.run:
    - name: docker rm redef_services_container || true
    - unless: docker inspect --format "{{ '{{' }} .Image {{ '}}' }}" redef_services_container | grep $(docker images | egrep "digibib/redef-services[[:space:]]+{{ pillar['redef']['image-tag'] }}[[:space:]]+" | awk '{ print $3 }')
    - require:
      - cmd: redef_services_container_stop_if_old

redef_services_container_installed:
  docker.installed:
    - name: redef_services_container
    - image: digibib/redef-services:{{ pillar['redef']['image-tag'] }}
    - ports:
      - "8080/tcp" # services
    - environment:
      - "KOHA_PORT": "http://{{ pillar['redef']['koha']['host'] }}:{{ pillar['redef']['koha']['port'] }}"
      - "KOHA_USER": {{ pillar['koha']['adminuser'] }} # TODO Should have separate user
      - "KOHA_PASSWORD": {{ pillar['koha']['adminpass'] }}  # TODO Should have separate user
      - "FUSEKI_PORT": "http://{{ pillar['redef']['fuseki']['host'] }}:{{ pillar['redef']['fuseki']['port'] }}"
    - require:
      - docker: redef_services_docker_image

redef_services_container_running:
  docker.running:
    - container: redef_services_container
    - port_bindings:
        "8080/tcp":
            HostIp: "{{ pillar['redef']['services']['binding'] }}"
            HostPort: "{{ pillar['redef']['services']['port'] }}"
    - check_is_running:
      - "redef_services_container"
    - watch:
      - docker: redef_services_container_installed
