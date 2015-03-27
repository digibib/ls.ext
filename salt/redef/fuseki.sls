
fuseki_data_volume_installed:
  docker.installed:
    - name: fuseki_data
    - image: busybox:latest
    - volumes:
      - /data

fuseki_data_volume_run_once:
  docker.running:
  - container: fuseki_data
  - volumes:
    - /data
  - check_is_running: False
  - require:
    - docker: fuseki_data_volume_installed

# Check if pulled fuseki image is newer than running container, if so: stop and delete running fuseki container
fuseki_container_stop_if_old:
  cmd.run:
    - name: docker stop fuseki_container || true
    - unless: "docker inspect --format \"{{ '{{' }} .Image {{ '}}' }}\" fuseki_container | grep $(docker history --quiet --no-trunc fisch42/fuseki:latest | head -n 1)"
    - require:
      - docker: fuseki_docker_image

fuseki_container_remove_if_old:
  cmd.run:
    - name: docker rm fuseki_container || true
    - unless: "docker inspect --format \"{{ '{{' }} .Image {{ '}}' }}\" fuseki_container | grep $(docker history --quiet --no-trunc fisch42/fuseki:latest | head -n 1)"
    - require:
      - cmd: fuseki_container_stop_if_old

fuseki_container_installed:
  docker.installed:
    - name: fuseki_container
    - image: fisch42/fuseki:latest # Version MUST be in line with the one used in fuseki_container_stop_if_old
    - ports:
      - "3030/tcp"
    - require:
      - docker: fuseki_docker_image

fuseki_container_running:
  docker.running:
    - container: fuseki_container
    - port_bindings:
        "3030/tcp":
            HostIp: "{{ pillar['redef']['fuseki']['binding'] }}"
            HostPort: "{{ pillar['redef']['fuseki']['port'] }}"
    - volumes_from:
      - "fuseki_data"
    - watch:
      - docker: fuseki_data_volume_installed
      - docker: fuseki_data_volume_run_once
      - docker: fuseki_container_installed
