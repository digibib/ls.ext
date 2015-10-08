
include:
  - .skeletonbuild

{% set container = 'redef_patron_client_skeleton_container' %}
{% set repo = 'digibib' %}
{% set image = 'redef-patron-client-skeleton' %}
{% set tag = 'latest' %}
{% set command = 'npm run gulp' %}
{% set ports = ['8000/tcp'] %}
{% set environment = { 'SERVICES_PORT': "tcp://{0}:{1}".format(pillar['redef']['services']['host'], pillar['redef']['services']['port']) } %}
{% set port_bindings = {'8000/tcp': { 'HostIp': pillar['redef']['patron-client']['binding'], 'HostPort': pillar['redef']['patron-client']['port'] } } %}
{% set host_volume_bindings = [
 { 'host': '/vagrant/redef/patron-client/src', 'container': '/usr/src/app/src', 'ro': false },
 { 'host': '/vagrant/redef/patron-client/module-test', 'container': '/usr/src/app/module-test', 'ro': false },
 { 'host': '/vagrant/redef/patron-client/test', 'container': '/usr/src/app/test', 'ro': false }]
%}

{% include 'docker-run.sls-fragment' %}
