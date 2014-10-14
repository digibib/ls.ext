##########
# KIBANA DOCKER CONTAINER
##########

kibana_container_stop_if_old:
  cmd.run:
    - name: docker stop kibana_container || true # Next line baffling? http://jinja.pocoo.org/docs/dev/templates/#escaping - Note: egrep-expression must yield single line
    - unless: docker inspect --format "{{ '{{' }} .Image {{ '}}' }}" kibana_container | grep $(docker images | egrep "digibib/koha-salt-docker[[:space:]]*latest[[:space:]]+" | awk '{ print $3 }')
    - require:
      - docker: kibana_docker_image

kibana_container_remove_if_old:
  cmd.run:
    - name: docker rm kibana_container || true
    - unless: docker inspect --format "{{ '{{' }} .Image {{ '}}' }}" kibana_container | grep $(docker images | egrep "digibib/koha-salt-docker[[:space:]]*latest[[:space:]]+" | awk '{ print $3 }')
    - require:
      - cmd: kibana_container_stop_if_old

kibana_container_installed:
  docker.installed:
    - name: kibana_container
    - image: pblittle/docker-logstash
    - environment:
      - LF_SSL_CERT_KEY_URL: https://raw.githubusercontent.com/digibib/ls.ext/master/salt/kibana/files/tls/private/logstash-forwarder.key
      - LF_SSL_CERT_URL: https://raw.githubusercontent.com/digibib/ls.ext/master/salt/kibana/files/tls/certs/logstash-forwarder.crt
      - LOGSTASH_CONFIG_FILE: https://raw.githubusercontent.com/digibib/ls.ext/logging/salt/kibana/files/logstash.conf
    - ports:
      - "9292/tcp" # kibana
      - "9200/tcp" # elasticsearch
    - require:
      - docker: kibana_docker_image

kibana_container_running:
  docker.running:
    - container: kibana_container
    - port_bindings:
        "9292/tcp":
            HostIp: "0.0.0.0"
            HostPort: "9292"
        "9200/tcp":
            HostIp: "0.0.0.0"
            HostPort: "9200"
    - check_is_running:
      - "kibana_container"
    - watch:
      - docker: kibana_container_installed
