
{% set repo = 'digibib' %}
{% set image = 'redef-catalinker' %}
{% set tag = pillar['GITREF'] %}

{% include 'docker-pull.sls-fragment' %}

{% set container = 'redef_catalinker_container' %}
{% set ports = ["4567/tcp"] %}
{% include 'redef/catalinker/environment.sls-fragment' %}
{% set port_bindings = {'4567/tcp': { 'HostIp': pillar['redef']['catalinker']['binding'], 'HostPort': pillar['redef']['catalinker']['port'] } } %}

{% include 'docker-run.sls-fragment' %}
