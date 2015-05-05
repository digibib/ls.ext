
{% set container = 'redef_patron_client_container' %}
{% set repo = 'digibib' %}
{% set image = 'redef-patron-client' %}
{% set tag = pillar['redef']['image-tag'] %}
{% set ports = ['8000/tcp'] %}
{% set environment = { 'SERVICES_PORT': "tcp://{0}:{1}".format(pillar['redef']['services']['host'], pillar['redef']['services']['port']) } %}
{% set port_bindings = {'8000/tcp': { 'HostIp': pillar['redef']['patron-client']['binding'], 'HostPort': pillar['redef']['patron-client']['port'] } } %}
{% set data_volume = {} %}

{% include 'docker.sls-fragment' %}
