
redef_catalinker_container_stop_if_old:
  cmd.run:
    - name: docker stop redef_catalinker_container || true # Next line baffling? http://jinja.pocoo.org/docs/dev/templates/#escaping - Note: egrep-expression must yield single line
    - unless: docker inspect --format "{{ '{{' }} .Image {{ '}}' }}" redef_catalinker_container | grep $(docker images | egrep "digibib/redef-catalinker[[:space:]]+{{ pillar['redef']['image-tag'] }}[[:space:]]+" | awk '{ print $3 }')
    - require:
      - docker: redef_catalinker_docker_image

redef_catalinker_container_remove_if_old:
  cmd.run:
    - name: docker rm redef_catalinker_container || true
    - unless: docker inspect --format "{{ '{{' }} .Image {{ '}}' }}" redef_catalinker_container | grep $(docker images | egrep "digibib/redef-catalinker[[:space:]]+{{ pillar['redef']['image-tag'] }}[[:space:]]+" | awk '{ print $3 }')
    - require:
      - cmd: redef_catalinker_container_stop_if_old

redef_catalinker_container_installed:
  docker.installed:
    - name: redef_catalinker_container
    - image: digibib/redef-catalinker:{{ pillar['redef']['image-tag'] }}
    - ports:
      - "4567/tcp" # catalinker
    - environment:
      - "SERVICES_PORT": "tcp://{{ pillar['redef']['services']['host'] }}:{{ pillar['redef']['services']['port'] }}"
    - require:
      - docker: redef_catalinker_docker_image

redef_catalinker_container_running:
  docker.running:
    - container: redef_catalinker_container
    - port_bindings:
        "4567/tcp":
            HostIp: "{{ pillar['redef']['catalinker']['binding'] }}"
            HostPort: "{{ pillar['redef']['catalinker']['port'] }}"
    - check_is_running:
      - "redef_catalinker_container"
    - watch:
      - docker: redef_catalinker_container_installed
