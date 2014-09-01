installpkgs:
  pkg.installed:
    - pkgs:
      - apache2
      - firefox

logstash_repo:
  pkgrepo.managed:
    - name: deb http://packages.elasticsearch.org/logstash/1.4/debian stable main
    - key_url: http://packages.elasticsearch.org/GPG-KEY-elasticsearch

elasticsearch_repo:
  pkgrepo.managed:
    - name: deb http://packages.elasticsearch.org/elasticsearch/1.3/debian stable main
    - key_url: http://packages.elasticsearch.org/GPG-KEY-elasticsearch
   
install_logstash:
   pkg.installed:
    - name: logstash
    - skip_verify: True
    - require:
      - pkgrepo: logstash_repo

##### configure logstash #####
/etc/logstash/conf.d/01-lumberjack-input.conf:
  file.managed:
    - source: salt://files/01-lumberjack-input.conf
    - template: jinja
    - mode: 644
    - require:
      - pkg: logstash
/etc/logstash/conf.d/10-syslog.conf:
  file.managed:
    - source: salt://files/10-syslog.conf
    - template: jinja
    - mode: 644
    - require:
      - pkg: logstash

/etc/logstash/conf.d/30-lumberjack-output.conf:
  file.managed:
    - source: salt://files/30-lumberjack-output.conf
    - template: jinja
    - mode: 644
    - require:
      - pkg: logstash

/etc/pki/tls/certs/logstash-forwarder.crt:
 file.managed:
    - source: salt://files/tls/certs/logstash-forwarder.crt
    - template: jinja
    - mode: 644
    - makedirs: True
    - require:
      - pkg: logstash

/etc/pki/tls/private/logstash-forwarder.key:
 file.managed:
    - source: salt://files/tls/private/logstash-forwarder.key
    - template: jinja
    - mode: 644
    - makedirs: True
    - require:
      - pkg: logstash

##### install elasticsearch #####
install_elasticsearch:
   pkg.installed:
    - name: elasticsearch
    - skip_verify: True
    - require:
      - pkgrepo: elasticsearch_repo

install_kibana:
  pkg.installed:
    - pkgs:
      - unzip
  archive.extracted:
    - name: /var/www/
    - source: https://download.elasticsearch.org/kibana/kibana/kibana-3.1.0.zip
    - archive_format: zip
    - source_hash: md5=4836d0ef1218e93fb45d2c0e722bfa06
    - if_missing: /var/www/kibana-3.1.0
    - requires:
      - pkg: unzip

##### configure apache2
apache2:
  pkg.installed

sudo a2dissite 000-default:
  cmd.run:      
    - require:
      - pkg: apache2

kibana_apacheconfig:
  file.managed:
    - name: /etc/apache2/sites-available/100-kibana.conf
    - source: salt://files/kibana_conf.tmpl
    - template: jinja
    - mode: 644
    - context:
      OpacPort: 8080
      IntraPort: 8081
      ServerName: kibana
    - require:
      - pkg: apache2

sudo a2ensite 100-kibana:
  cmd.run:      
    - require:
      - pkg: apache2

##### start apache2
apache2_service:
  service.running:
    - name: apache2
    - enable: True
    - reload: True
    - require:
      - pkg: apache2
    - watch:
      - cmd: sudo a2dissite 000-default
      - cmd: sudo a2ensite 100-kibana

##### start elasticsearch
elasticsearch_service:
  service.running:
    - name: elasticsearch
    - require:
      - pkg: elasticsearch

##### start logstash
logstash_service:
  service.running:
    - name: logstash
    - watch:
      - file: /etc/logstash/conf.d/01-lumberjack-input.conf
      - file: /etc/logstash/conf.d/10-syslog.conf
      - file: /etc/logstash/conf.d/30-lumberjack-output.conf
    - require:
      - pkg: logstash

#### TODO implement "smoke test", i.e. check that ops is running and is healthy