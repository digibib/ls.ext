
openssl:
  pkg.installed

/etc/logstash/ssl.conf:
  file.managed:
    - source: {{ pillar['elk']['saltfiles'] }}/ssl.conf
    - user: root
    - group: root
    - mode: 644
    - template: jinja
    - require:
      - file: /etc/logstash

generate_logstash_keys: # https://gist.github.com/sandstrom/a92a9d384999c659d96a
  cmd.run:
    - name: openssl req -x509 -config /etc/logstash/ssl.conf -batch -nodes -newkey rsa:2048 -keyout /etc/logstash/logstash-forwarder.key -out /etc/logstash/logstash-forwarder.crt -days 3650
    - unless: [ -f "/etc/logstash/logstash-forwarder.crt" ]
    - require: 
      - pkg: openssl
      - file: /etc/logstash
    - watch:
      - file: /etc/logstash/ssl.conf

generate_logstash_key_hash:
  cmd.run:
    - name: cat /etc/logstash/logstash-forwarder.key | openssl dgst -sha256 > /etc/logstash/logstash-forwarder.key.hash
    - require:
      - pkg: openssl
      - file: /etc/logstash
    - watch:
      - cmd: generate_logstash_keys

generate_logstash_crt_hash:
  cmd.run:
    - name: cat /etc/logstash/logstash-forwarder.crt | openssl dgst -sha256 > /etc/logstash/logstash-forwarder.crt.hash
    - require:
      - pkg: openssl
      - file: /etc/logstash
    - watch:
      - cmd: generate_logstash_keys

/etc/logstash/logstash.conf:
  file.managed:
    - source: {{ pillar['elk']['saltfiles'] }}/logstash.conf
    - user: root
    - group: root
    - mode: 644
    - template: jinja
    - require:
      - file: /etc/logstash

nginx_docker_image:
  docker.pulled:
    - name: nginx:1.7.7

config_container_stop_if_old:
  cmd.run:
    - name: docker stop config_container || true # Next line baffling? http://jinja.pocoo.org/docs/dev/templates/#escaping - Note: egrep-expression must yield single line
    - unless: docker inspect --format "{{ '{{' }} .Image {{ '}}' }}" config_container | grep $(docker images | egrep "nginx[[:space:]]*1.7.7[[:space:]]+" | awk '{ print $3 }')
    - require:
      - docker: nginx_docker_image

config_container_remove_if_old:
  cmd.run:
    - name: docker rm config_container || true
    - unless: docker inspect --format "{{ '{{' }} .Image {{ '}}' }}" config_container | grep $(docker images | egrep "nginx[[:space:]]*1.7.7[[:space:]]+" | awk '{ print $3 }')
    - require:
      - cmd: config_container_stop_if_old

config_container_installed:
  docker.installed:
    - name: config_container
    - image: nginx:1.7.7
    - volumes:
      - /usr/share/nginx/html
    - require:
      - docker: nginx_docker_image

config_container_running:
  docker.running:
    - container: config_container
    - port_bindings:
        "80/tcp":
            HostIp: "0.0.0.0"
            HostPort: "{{ pillar['elk']['configserver-port'] }}"
    - binds:
        /etc/logstash/:
          bind: /usr/share/nginx/html
          ro: True
    - watch:
      - docker: config_container_installed
      - file: /etc/logstash/logstash.conf
      - cmd: generate_logstash_keys
