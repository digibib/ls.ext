# virtuoso.sls
{% set repo = 'tenforce' %}
{% set image = 'virtuoso' %}
{% set tag = 'virtuoso-v7.2.0-1' %}
{% set force_pull = false %}

{% include 'docker-pull.sls-fragment' %}

/etc/virtuoso.ini:
  file.managed:
    - source: salt://migration/files/virtuoso.ini
    - user: root
    - group: root
    - file_mode: 644

{% set container = 'virtuoso_container' %}
{% set ports = ["1111/tcp","8890/tcp"] %}
{% set environment = {'DBA_PASSWORD': pillar['koha']['adminpass'],'SPARQL_UPDATE': true } %}
{% set port_bindings = {'8890/tcp': { 'HostIp': pillar['redef']['triplestore']['binding'], 'HostPort': "8890" },
						'1111/tcp': { 'HostIp': pillar['redef']['triplestore']['binding'], 'HostPort': "1111" } } %}

{% set host_volume_bindings = [ { 'host': '/etc', 'container': '/var/lib/virtuoso/db', 'ro': false } ] %}
{% include 'docker-run.sls-fragment' %}