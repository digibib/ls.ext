
collectd_docker_image:
  docker.pulled:
    - name: andreasjansson/collectd-write-graphite

collectd_container_stop_if_old:
  cmd.run:
    - name: docker stop collectd_container || true # Next line baffling? http://jinja.pocoo.org/docs/dev/templates/#escaping - Note: egrep-expression must yield single line
    - unless: docker inspect --format "{{ '{{' }} .Image {{ '}}' }}" collectd_container | grep $(docker images | egrep "andreasjansson/collectd-write-graphite[[:space:]]*latest[[:space:]]+" | awk '{ print $3 }')
    - require:
      - docker: collectd_docker_image

collectd_container_remove_if_old:
  cmd.run:
    - name: docker rm collectd_container || true
    - unless: docker inspect --format "{{ '{{' }} .Image {{ '}}' }}" collectd_container | grep $(docker images | egrep "andreasjansson/collectd-write-graphite[[:space:]]*latest[[:space:]]+" | awk '{ print $3 }')
    - require:
      - cmd: collectd_container_stop_if_old

collectd_container_installed:
  docker.installed:
    - name: collectd_container
    - image: andreasjansson/collectd-write-graphite
    - environment:
      - "HOST_NAME": "{{ grains['fqdn'] }}"
      - "GRAPHITE_HOST": "{{ pillar['resource-monitoring']['graphite-line-receiver']['host'] }}"
      - "GRAPHITE_PORT": "{{ pillar['resource-monitoring']['graphite-line-receiver']['port'] }}"
    - require:
      - docker: collectd_docker_image

collectd_container_running:
  docker.running:
    - container: collectd_container
    - image: andreasjansson/collectd-write-graphite
    - check_is_running:
      - "collectd_container"
    - watch:
      - docker: collectd_container_installed
