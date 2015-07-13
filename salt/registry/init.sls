
{% set image = 'registry' %}
{% set tag = '0.9.1' %}

{% include 'docker-pull.sls-fragment' %}

{% set container = 'docker-registry' %}
{% set ports = ['5000/tcp'] %}
{% set environment = { 'STANDALONE': "false",
                       'MIRROR_SOURCE': "https://registry-1.docker.io",
                       'MIRROR_SOURCE_INDEX': "https://index.docker.io"
                     } %}
{% set port_bindings = {'5000/tcp': { 'HostIp': pillar['registry']['binding'], 'HostPort': pillar['registry']['port'] } } %}

{% include 'docker-run.sls-fragment' %}
