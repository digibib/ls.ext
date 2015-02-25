
graphite_docker_image:
  docker.pulled:
    - name: nickstenning/graphite

graphite_container_stop_if_old:
  cmd.run:
    - name: docker stop graphite_container || true # Next line baffling? http://jinja.pocoo.org/docs/dev/templates/#escaping - Note: egrep-expression must yield single line
    - unless: docker inspect --format "{{ '{{' }} .Image {{ '}}' }}" graphite_container | grep $(docker images | egrep "nickstenning/graphite[[:space:]]*latest[[:space:]]+" | awk '{ print $3 }')
    - require:
      - docker: graphite_docker_image

graphite_container_remove_if_old:
  cmd.run:
    - name: docker rm graphite_container || true
    - unless: docker inspect --format "{{ '{{' }} .Image {{ '}}' }}" graphite_container | grep $(docker images | egrep "nickstenning/graphite[[:space:]]*latest[[:space:]]+" | awk '{ print $3 }')
    - require:
      - cmd: graphite_container_stop_if_old

graphite_container_installed:
  docker.installed:
    - name: graphite_container
    - image: nickstenning/graphite
    - ports:
      - "80/tcp" # graphite web
      - "2003/tcp" # the carbon-cache line receiver (the standard graphite protocol)
      - "2004/tcp" # the carbon-cache pickle receiver
      - "7002/tcp" # the carbon-cache query port (used by the web interface)
    - require:
      - docker: graphite_docker_image

graphite_container_running:
  docker.running:
    - container: graphite_container
    - port_bindings:
        "80/tcp":
            HostIp: "0.0.0.0"
            HostPort: "8088"
        "2003/tcp":
            HostIp: "0.0.0.0"
            HostPort: "{{ pillar['resource-monitoring']['graphite-port'] }}"
        "2004/tcp":
            HostIp: "0.0.0.0"
            HostPort: "2004"
        "7002/tcp":
            HostIp: "0.0.0.0"
            HostPort: "7002"
    - check_is_running:
      - "graphite_container"
    - watch:
      - docker: graphite_container_installed
