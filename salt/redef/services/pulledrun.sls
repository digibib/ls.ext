
{% set repo = 'digibib' %}
{% set image = 'redef-services' %}
{% set tag = pillar['GITREF'] %}

{% include 'docker-pull.sls-fragment' %}

{% set container = 'redef_services_container' %}
{% set ports = ['8080/tcp'] %}
{% set environment = { 'KOHA_PORT': "http://{0}:{1}".format(pillar['redef']['koha']['host'], pillar['redef']['koha']['port_intra']),
                       'KOHA_USER': pillar['koha']['adminuser'],
                       'KOHA_PASSWORD': pillar['koha']['adminpass'],
                       'FUSEKI_PORT': "http://{0}:{1}".format(pillar['redef']['fuseki']['host'], pillar['redef']['fuseki']['port']),
                       'DATA_BASEURI': pillar['redef']['services']['baseuri'] } %}
{% set port_bindings = {'8080/tcp': { 'HostIp': pillar['redef']['services']['binding'], 'HostPort': pillar['redef']['services']['port'] } } %}

{% include 'docker-run.sls-fragment' %}
