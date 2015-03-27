
redef_patron_client_container_stop_if_old:
  cmd.run:
    - name: docker stop redef_patron_client_container || true # Next line baffling? http://jinja.pocoo.org/docs/dev/templates/#escaping - Note: egrep-expression must yield single line
    - unless: docker inspect --format "{{ '{{' }} .Image {{ '}}' }}" redef_patron_client_container | grep $(docker images | egrep "digibib/redef-patron-client[[:space:]]+{{ pillar['redef']['image-tag'] }}[[:space:]]+" | awk '{ print $3 }')
    - require:
      - docker: redef_patron_client_docker_image

redef_patron_client_container_remove_if_old:
  cmd.run:
    - name: docker rm redef_patron_client_container || true
    - unless: docker inspect --format "{{ '{{' }} .Image {{ '}}' }}" redef_patron_client_container | grep $(docker images | egrep "digibib/redef-patron-client[[:space:]]+{{ pillar['redef']['image-tag'] }}[[:space:]]+" | awk '{ print $3 }')
    - require:
      - cmd: redef_patron_client_container_stop_if_old

redef_patron_client_container_installed:
  docker.installed:
    - name: redef_patron_client_container
    - image: digibib/redef-patron-client:{{ pillar['redef']['image-tag'] }}
    - ports:
      - "8000/tcp" # patron-client
    - environment:
      - "SERVICES_PORT": "tcp://{{ pillar['redef']['services']['host'] }}:{{ pillar['redef']['services']['port'] }}"
    - require:
      - docker: redef_patron_client_docker_image

redef_patron_client_container_running:
  docker.running:
    - container: redef_patron_client_container
    - port_bindings:
        "8000/tcp":
            HostIp: "{{ pillar['redef']['patron-client']['binding'] }}"
            HostPort: "{{ pillar['redef']['patron-client']['port'] }}"
    - check_is_running:
      - "redef_patron_client_container"
    - watch:
      - docker: redef_patron_client_container_installed
