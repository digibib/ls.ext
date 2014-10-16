##########
# LOG FORWARDING CONTAINER
##########

log_container_stop_if_old:
  cmd.run:
    - name: docker stop log_container || true
    - unless: docker inspect --format "{{ '{{' }} .Image {{ '}}' }}" log_container | grep $(docker images | egrep "digibib/koha-salt-docker[[:space:]]*latest[[:space:]]+" | awk '{ print $3 }')
    - require:
      - docker: log_image_built

log_container_remove_if_old:
  cmd.run:
    - name: docker rm log_container || true
    - unless: docker inspect --format "{{ '{{' }} .Image {{ '}}' }}" log_container | grep $(docker images | egrep "digibib/koha-salt-docker[[:space:]]*latest[[:space:]]+" | awk '{ print $3 }')
    - require:
      - cmd: log_container_stop_if_old

log_image_built:
  docker.built:
    - name: log_image
    - path: /srv/salt/elk/log_forwarder # TODO how to get the salt:// path?

log_container_installed:
  docker.installed:
    - name: log_container
    - image: log_image
    - volumes:
      - /var/log
    - require:
      - docker: log_image_built

log_container_running:
  docker.running:
    - container: log_container
    - volumes_from:
      - "koha_logs_volume"
    - watch:
      - docker: log_container_installed
