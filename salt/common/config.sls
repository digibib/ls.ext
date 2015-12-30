###########
# KOHA SPECIFIC CONFIG
###########

apache2:
  service.dead

/var/migration_workdir:
  file.directory:
    - user: root
    - group: root
    - dir_mode: 755
    - file_mode: 644
    - recurse:
      - user
      - group
      - mode

###########
# Services specific config
###########

{% set build_context = '/vagrant/redef/services' %}

{{ image }}_gradle_oneJar:
  cmd.run:
  - name: ./gradlew --no-daemon build oneJar
  - cwd: {{ build_context }}
  - user: vagrant

##########
# Elasticsearch specifig config
##########

/etc/elasticsearch.yml:
  file.managed:
    - source: salt://redef/elasticsearch/config/elasticsearch.yml
    - user: root
    - group: root
    - file_mode: 644

##########
# Overview specifig config
##########

/var/www:
  file.directory

/var/www/overview:
  file.directory:
    - user: root
    - group: root
    - dir_mode: 755
    - file_mode: 644
    - recurse:
      - user
      - group
      - mode
    - require:
      - file: /var/www

/var/www/overview/index.html:
  file.managed:
    - source: {{ pillar['overview']['saltfiles'] }}/index.template.html
    - template: jinja
    - require:
      - file: /var/www/overview

/var/www/overview/logo.png:
  file.managed:
    - source: {{ pillar['overview']['saltfiles'] }}/logo.png
    - template: jinja
    - require:
      - file: /var/www/overview

##########
# TEMPORARY PLACEHOLDER: Redef skeleton bindings
##########

{% set catalinker_host_volume_bindings = [
 { 'host': '/vagrant/redef/catalinker/client', 'container': '/usr/src/app/client', 'ro': false },
 { 'host': '/vagrant/redef/catalinker/module-test', 'container': '/usr/src/app/module-test', 'ro': false },
 { 'host': '/vagrant/redef/catalinker/public', 'container': '/usr/src/app/public', 'ro': false }]
%}

{% set patron_client_host_volume_bindings = [
 { 'host': '/vagrant/redef/patron-client/client', 'container': '/usr/src/app/client', 'ro': false },
 { 'host': '/vagrant/redef/patron-client/public', 'container': '/usr/src/app/public', 'ro': false },
 { 'host': '/vagrant/redef/patron-client/module-test', 'container': '/usr/src/app/module-test', 'ro': false },
 { 'host': '/vagrant/redef/patron-client/test', 'container': '/usr/src/app/test', 'ro': false }]
%}