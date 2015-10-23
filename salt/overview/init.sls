{% set image = 'connexiolabs/alpine-nginx' %}
{% set tag = '1.7.11' %}
{% set container = 'overview_container' %}

{% include 'docker-pull.sls-fragment' %}

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
    - required_in:
      - {{ container }}_running

/var/www/overview/logo.png:
  file.managed:
    - source: {{ pillar['overview']['saltfiles'] }}/logo.png
    - template: jinja
    - require:
      - file: /var/www/overview
    - required_in:
      - {{ container }}_running

{% set ports = ['80/tcp'] %}
{% set port_bindings = {'80/tcp': { 'HostIp': pillar['overview']['binding'], 'HostPort': pillar['overview']['port'] } } %}
{% set host_volume_bindings = [ { 'host': '/var/www/overview', 'container': '/etc/nginx/html', 'ro': false } ] %}

{% set watchers = [ { "type": "file", "state": "/var/www/overview/index.html" } ] %}

{% include 'docker-run.sls-fragment' %}
