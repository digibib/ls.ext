##### logstash forwarder #####
logstash-forwarder_repo:
  pkgrepo.managed:
    - name: deb http://packages.elasticsearch.org/logstashforwarder/debian stable main
    - key_url: http://packages.elasticsearch.org/GPG-KEY-elasticsearch

install_logstash-forwarder:
   pkg.installed:
    - name: logstash-forwarder
    - skip_verify: True
    - require:
      - pkgrepo: logstash-forwarder_repo

install_init_script:
   file.managed:
    - name: /etc/init.d/logstash-forwarder
    - source: https://raw.github.com/elasticsearch/logstash-forwarder/master/logstash-forwarder.init
    - source_hash: md5=160798cf5e809784dd3c00f7940215d4 
    - mode: 755
    - require:
      - pkg: logstash-forwarder
   cmd.run:
    - name: sudo update-rc.d logstash-forwarder defaults
    - watch:
      - file: /etc/init.d/logstash-forwarder

configure_logstash-forwarder:
   file.managed:
     - name: /etc/logstash-forwarder
     - source: {{ pillar['koha']['saltfiles'] }}/logstash-forwarder.conf
     - template: jinja

###  - Copy certificates from devops to server
install_logstash_certificates:
  file.managed:
     - name: /etc/pki/tls/certs/logstash-forwarder.crt
     - source:  {{ pillar['koha']['saltfiles'] }}/logstash-forwarder.crt
     - makedirs: True

##### start logstash-forwarder
logstash-forwarder_service:
  service.running:
    - name: logstash-forwarder
    - watch:
      - file: /etc/init.d/logstash-forwarder
      - file: /etc/pki/tls/certs/logstash-forwarder.crt
    - require:
      - pkg: logstash-forwarder

### NOTE
### - Credits to https://www.digitalocean.com/community/tutorials/how-to-use-logstash-and-kibana-to-centralize-and-visualize-logs-on-ubuntu-14-04#BuildandPackageLogstashForwarder
