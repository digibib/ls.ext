{% set container = 'redef_catalinker_container' %}
{% set repo = 'digibib' %}
{% set image = 'redef-catalinker' %}
{% set tag = pillar['redef']['image-tag'] %}
{% set ports = ["4567/tcp"] %}
{% set environment = {'SERVICES_PORT': "http://{0}:{1}".format(pillar['redef']['services']['host'], pillar['redef']['services']['port']) }  %}
{% set port_bindings = {'4567/tcp': { 'HostIp': pillar['redef']['catalinker']['binding'], 'HostPort': pillar['redef']['catalinker']['port'] } } %}
{% set data_volume = {} %}

{% include 'docker.sls-fragment' %}
