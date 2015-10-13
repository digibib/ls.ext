{% set image = 'registry' %}
{% set tag = '2' %}

{% include 'docker-pull.sls-fragment' %}

{% set container = 'registry' %}
{% set ports = ['5000/tcp'] %}
{% set port_bindings = {'5000/tcp': { 'HostIp': pillar['registry']['binding'], 'HostPort': pillar['registry']['port'] } } %}

{% include 'docker-run.sls-fragment' %}
