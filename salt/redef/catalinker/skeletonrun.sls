
include:
  - .skeletonbuild

{% set container = 'redef_patron_client_skeleton_container' %}
{% set repo = 'digibib' %}
{% set image = 'redef-catalinker-skeleton' %}
{% set tag = 'latest' %}
{% set command = 'npm run gulp' %}
{% set ports = ['8010/tcp'] %}
{% set environment = { 'SERVICES_PORT': "tcp://{0}:{1}".format(pillar['redef']['services']['host'], pillar['redef']['services']['port']) } %}
{% set port_bindings = {'8010/tcp': { 'HostIp': pillar['redef']['catalinker']['binding'], 'HostPort': pillar['redef']['catalinker']['port'] } } %}
{% set host_volume_bindings = [
 { 'host': '/vagrant/redef/catalinker/client', 'container': '/usr/src/app/client', 'ro': false },
 { 'host': '/vagrant/redef/catalinker/module-test', 'container': '/usr/src/app/module-test', 'ro': false },
 { 'host': '/vagrant/redef/catalinker/test', 'container': '/usr/src/app/test', 'ro': false },
 { 'host': '/vagrant/redef/catalinker/public', 'container': '/usr/src/app/public', 'ro': false }]
%}

{% include 'docker-run.sls-fragment' %}
