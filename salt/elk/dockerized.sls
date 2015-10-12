##########
# ELK DATA VOLUME
##########
elk_data_volume_installed:
  docker.installed:
    - name: elk_data
    - image: busybox
    - volumes:
      - /data/elasticsearch


elk_data_volume_run_once:
  docker.running:
  - container: elk_data
  - image: busybox
  - volumes:
    - /data/elasticsearch
  - check_is_running: False
  - require:
    - docker: elk_data_volume_installed


##########
# ELK CONTAINER
##########

elk_container_stop_if_old:
  cmd.run:
    - name: docker stop elk_container || true # Next line baffling? http://jinja.pocoo.org/docs/dev/templates/#escaping - Note: egrep-expression must yield single line
    - unless: docker inspect --format "{{ '{{' }} .Image {{ '}}' }}" elk_container | grep $(docker images | egrep "pblittle/docker-logstash[[:space:]]*{{ pillar['elk']['logstash']['image-tag'] }}[[:space:]]+" | awk '{ print $3 }')
    - require:
      - docker: elk_docker_image

elk_container_remove_if_old:
  cmd.run:
    - name: docker rm elk_container || true
    - unless: docker inspect --format "{{ '{{' }} .Image {{ '}}' }}" elk_container | grep $(docker images | egrep "pblittle/docker-logstash[[:space:]]*{{ pillar['elk']['logstash']['image-tag'] }}[[:space:]]+" | awk '{ print $3 }')
    - require:
      - cmd: elk_container_stop_if_old

elk_container_installed:
  docker.installed:
    - name: elk_container
    - image: pblittle/docker-logstash:{{ pillar['elk']['logstash']['image-tag'] }}
    - environment:
      - LF_SSL_CERT_KEY_URL: "http://{{ pillar['elk']['configserver']['host'] }}:{{ pillar['elk']['configserver']['port'] }}/logstash-forwarder.key"
      - LF_SSL_CERT_URL: "http://{{ pillar['elk']['configserver']['host'] }}:{{ pillar['elk']['configserver']['port'] }}/logstash-forwarder.crt"
      - LOGSTASH_CONFIG_URL: "http://{{ pillar['elk']['configserver']['host'] }}:{{ pillar['elk']['configserver']['port'] }}/logstash.conf"
      - LS_HEAP_SIZE: "2048m"
    - ports:
      - "5000/tcp" # lumberjack
      - "9292/tcp" # kibana
      - "9200/tcp" # elasticsearch
    - require:
      - docker: elk_docker_image
      - docker: config_container_running

elk_container_running:
  docker.running:
    - container: elk_container
    - image: pblittle/docker-logstash:{{ pillar['elk']['logstash']['image-tag'] }}
    - port_bindings:
        "5000/tcp":
            HostIp: "{{ pillar['elk']['lumberjack']['binding'] }}"
            HostPort: "{{ pillar['elk']['lumberjack']['port'] }}"
        "9292/tcp":
            HostIp: "{{ pillar['elk']['kibana']['binding'] }}"
            HostPort: "{{ pillar['elk']['kibana']['port'] }}"
        "9200/tcp":
            HostIp: "{{ pillar['elk']['elasticsearch']['binding'] }}"
            HostPort: "{{ pillar['elk']['elasticsearch']['port'] }}"
    - check_is_running:
      - "elk_container"
    - volumes_from:
      - "elk_data"
    - watch:
      - docker: elk_container_installed
      - docker: elk_data_volume_run_once
