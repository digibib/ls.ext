
include:
  - .skeletonbuild

{% set container = 'redef_patron_client_skeleton_container' %}
{% set repo = 'digibib' %}
{% set image = 'redef-patron-client-skeleton' %}
{% set tag = 'latest' %}
{% set command = 'npm run-script start-dev' %}
{% set ports = ['8000/tcp'] %}
{% set environment = { 'SERVICES_PORT': "tcp://{0}:{1}".format(pillar['redef']['services']['host'], pillar['redef']['services']['port']) } %}
{% set port_bindings = {'8000/tcp': { 'HostIp': pillar['redef']['patron-client']['binding'], 'HostPort': pillar['redef']['patron-client']['port'] } } %}
{% set host_volume_bindings = [ { 'host': '/vagrant/redef/patron-client', 'container': '/usr/src/app', 'ro': false } ] %}

{% include 'docker-run.sls-fragment' %}
