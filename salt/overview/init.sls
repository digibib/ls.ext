{% set image = 'nginx' %}
{% set tag = '1.9.3' %}

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

{% set container = 'overview_container' %}
{% set ports = ['80/tcp'] %}
{% set port_bindings = {'80/tcp': { 'HostIp': pillar['overview']['binding'], 'HostPort': pillar['overview']['port'] } } %}
{% set host_volume_bindings = [ { 'host': '/var/www/overview', 'container': '/usr/share/nginx/html', 'ro': true } ] %}


/var/www/overview/index.html:
  file.managed:
    - source: {{ pillar['overview']['saltfiles'] }}/index.template.html
    - user: root
    - group: root
    - mode: 644
    - template: jinja
    - require:
      - file: /var/www/overview
    - required_in:
      - {{ container }}_running

{% include 'docker-run.sls-fragment' %}
