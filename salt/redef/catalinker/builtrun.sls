
include:
  - .skeletonbuild

{% set repo = 'digibib' %}
{% set image = 'redef-catalinker' %}
{% set tag = 'latest' %}
{% set build_context = '/vagrant/redef/catalinker' %}
{% set dockerfile = 'Dockerfile' %}

{% include 'docker-build.sls-fragment' %}

{% set container = 'redef_catalinker_container' %}
{% set ports = ["8010/tcp"] %}
{% set port_bindings = {'8010/tcp': { 'HostIp': pillar['redef']['catalinker']['binding'], 'HostPort': pillar['redef']['catalinker']['port'] } } %}
{% set environment = {
    'KOHA_INTRA_PORT': "http://{0}:{1}".format(pillar['redef']['koha']['host'], pillar['redef']['koha']['port_intra']),
    'KOHA_OPAC_PORT': "http://{0}:{1}".format(pillar['redef']['koha']['host'], pillar['redef']['koha']['port_opac']),
    'SERVICES_PORT': "http://{0}:{1}".format(pillar['redef']['services']['host'],pillar['redef']['services']['port']) } %}

{% include 'docker-run.sls-fragment' %}
