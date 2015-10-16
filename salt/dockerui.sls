{% set repo = 'dockerui' %}
{% set image = 'dockerui' %}
{% set tag = 'latest' %}

{% include 'docker-pull.sls-fragment' %}

{% set container = 'dockerui_container' %}
{% set ports = ["9000/tcp"] %}
{% set environment = {} %}
{% set port_bindings = {'9000/tcp': { 'HostIp': pillar['dockerui']['binding'], 'HostPort': pillar['dockerui']['port'] } } %}
{% set host_volume_bindings = [ { 'host': '/var/run/docker.sock', 'container': '/var/run/docker.sock', 'ro': false } ] %}
{% set privileged = true %}

{% include 'docker-run.sls-fragment' %}
