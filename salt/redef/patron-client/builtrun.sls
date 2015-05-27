
include:
  - .skeletonbuild

{% set repo = 'digibib' %}
{% set image = 'redef-patron-client' %}
{% set tag = 'latest' %}
{% set build_context = '/vagrant/redef/patron-client' %}
{% set dockerfile = 'Dockerfile' %}

{% include 'docker-build.sls-fragment' %}

{% set container = 'redef_patron_client_container' %}
{% set ports = ['8000/tcp'] %}
{% set environment = { 'SERVICES_PORT': "tcp://{0}:{1}".format(pillar['redef']['services']['host'], pillar['redef']['services']['port']) } %}
{% set port_bindings = {'8000/tcp': { 'HostIp': pillar['redef']['patron-client']['binding'], 'HostPort': pillar['redef']['patron-client']['port'] } } %}

{% include 'docker-run.sls-fragment' %}
