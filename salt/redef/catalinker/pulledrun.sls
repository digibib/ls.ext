
{% set repo = 'digibib' %}
{% set image = 'redef-catalinker' %}
{% set tag = pillar['GITREF'] %}

{% include 'docker-pull.sls-fragment' %}

{% set container = 'redef_catalinker_container' %}
{% set ports = ["4567/tcp"] %}
{% set environment = {
    'KOHA_INTRA_PORT': "http://{0}:{1}".format(pillar['redef']['koha']['host'], pillar['redef']['koha']['port_intra']),
    'KOHA_OPAC_PORT': "http://{0}:{1}".format(pillar['redef']['koha']['host'], pillar['redef']['koha']['port_opac']),
    'SERVICES_PORT': "http://{0}:{1}".format(pillar['redef']['services']['host'],pillar['redef']['services']['port']) } %}
{% set port_bindings = {'4567/tcp': { 'HostIp': pillar['redef']['catalinker']['binding'], 'HostPort': pillar['redef']['catalinker']['port'] } } %}

{% include 'docker-run.sls-fragment' %}
