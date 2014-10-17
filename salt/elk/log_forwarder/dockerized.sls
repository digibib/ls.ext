##########
# LOG FORWARDING CONTAINER
##########

lf_container_stop_if_old:
  cmd.run:
    - name: docker stop lf_container || true
    - unless: docker inspect --format "{{ '{{' }} .Image {{ '}}' }}" lf_container | grep $(docker images | egrep "digibib/koha-salt-docker[[:space:]]*latest[[:space:]]+" | awk '{ print $3 }')
    - require:
      - docker: lf_image_built

lf_container_remove_if_old:
  cmd.run:
    - name: docker rm lf_container || true
    - unless: docker inspect --format "{{ '{{' }} .Image {{ '}}' }}" lf_container | grep $(docker images | egrep "digibib/koha-salt-docker[[:space:]]*latest[[:space:]]+" | awk '{ print $3 }')
    - require:
      - cmd: lf_container_stop_if_old

lf_image_built:
  docker.built:
    - name: lf_image
    - path: /srv/salt/elk/log_forwarder # TODO how to get the salt:// path?

lf_container_installed:
  docker.installed:
    - name: lf_container
    - image: lf_image
    - require:
      - docker: lf_image_built

lf_container_running:
  docker.running:
    - container: lf_container
    - volumes_from:
      - "koha_logs_volume"
    - watch:
      - docker: lf_container_installed
