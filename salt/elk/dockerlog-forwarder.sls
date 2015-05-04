
/etc/logstash/dockerlog-forwarder.conf:
  file.managed:
    - source: "{{ pillar['elk']['saltfiles'] }}/dockerlog-forwarder.conf"
    - template: jinja
    - user: root
    - group: root
    - mode: 644
    - require:
      - file: /etc/logstash

/etc/logstash/logstash-forwarder.key:
  file.managed:
    - source: "http://{{ pillar['elk']['configserver-host'] }}:{{ pillar['elk']['configserver-port'] }}/logstash-forwarder.key"
    - source_hash: "http://{{ pillar['elk']['configserver-host'] }}:{{ pillar['elk']['configserver-port'] }}/logstash-forwarder.key.hash"
    - user: root
    - group: root
    - mode: 644
    - require:
      - file: /etc/logstash

/etc/logstash/logstash-forwarder.crt:
  file.managed:
    - source: "http://{{ pillar['elk']['configserver-host'] }}:{{ pillar['elk']['configserver-port'] }}/logstash-forwarder.crt"
    - source_hash: "http://{{ pillar['elk']['configserver-host'] }}:{{ pillar['elk']['configserver-port'] }}/logstash-forwarder.crt.hash"
    - user: root
    - group: root
    - mode: 644
    - require:
      - file: /etc/logstash

logstash-forwarder-image:
  docker.pulled:
    - name: digitalwonderland/logstash-forwarder:{{ pillar['elk']['logforwarder']['image-tag'] }}

dockerlogs_forwarder_container_stop_if_old:
  cmd.run:
    - name: docker stop dockerlogs_forwarder_container || true # Next line baffling? http://jinja.pocoo.org/docs/dev/templates/#escaping - Note: egrep-expression must yield single line
    - unless: docker inspect --format "{{ '{{' }} .Image {{ '}}' }}" dockerlogs_forwarder_container | grep $(docker images | egrep "digitalwonderland/logstash-forwarder[[:space:]]*{{ pillar['elk']['logforwarder']['image-tag'] }}[[:space:]]+" | awk '{ print $3 }')
    - require:
      - docker: logstash-forwarder-image
    - watch:
      - file: /etc/logstash/logstash-forwarder.crt
      - file: /etc/logstash/logstash-forwarder.key
      - file: /etc/logstash/dockerlog-forwarder.conf

dockerlogs_forwarder_container_remove_if_old:
  cmd.run:
    - name: docker rm dockerlogs_forwarder_container || true
    - unless: docker inspect --format "{{ '{{' }} .Image {{ '}}' }}" dockerlogs_forwarder_container | grep $(docker images | egrep "digitalwonderland/logstash-forwarder[[:space:]]*{{ pillar['elk']['logforwarder']['image-tag'] }}[[:space:]]+" | awk '{ print $3 }')
    - watch:
      - cmd: dockerlogs_forwarder_container_stop_if_old
      - file: /etc/logstash/logstash-forwarder.crt
      - file: /etc/logstash/logstash-forwarder.key
      - file: /etc/logstash/dockerlog-forwarder.conf

dockerlogs_forwarder_container_installed:
  docker.installed:
    - name: dockerlogs_forwarder_container
    - image: digitalwonderland/logstash-forwarder:{{ pillar['elk']['logforwarder']['image-tag'] }}
    - command: ["-logstash", "{{ pillar['elk']['lumberjack-host'] }}:{{ pillar['elk']['lumberjack-port'] }}", "-lazyness", "60", "-config", "/etc/logstash/dockerlog-forwarder.conf"]
    - volumes:
      - /etc/logstash
      - /var/lib/docker
      - /var/run/docker.sock
    - watch:
      - docker: digitalwonderland/logstash-forwarder
      - file: /etc/logstash/logstash-forwarder.crt
      - file: /etc/logstash/logstash-forwarder.key
      - file: /etc/logstash/dockerlog-forwarder.conf

dockerlogs_forwarder_container_running:
  docker.running:
    - container: dockerlogs_forwarder_container
    - check_is_running:
      - "dockerlogs_forwarder_container"
    - binds:
        /etc/logstash/:
          bind: /etc/logstash
          ro: True
        /var/lib/docker/:
          bind: /var/lib/docker
          ro: True
        /var/run/docker.sock/:
          bind: "/var/run/docker.sock"
    - watch:
      - docker: dockerlogs_forwarder_container_installed
