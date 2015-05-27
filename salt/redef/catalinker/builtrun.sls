
include:
  - .skeletonbuild

{% set repo = 'digibib' %}
{% set image = 'redef-catalinker' %}
{% set tag = 'latest' %}
{% set build_context = '/vagrant/redef/catalinker/server' %}
{% set dockerfile = 'Dockerfile' %}

{% include 'docker-build.sls-fragment' %}

extend:
  redef-catalinker_built:
    cmd.run:
      - require:
        - cmd: redef-catalinker-skeleton_built
        - cmd: copy_skeleton_gemfile_lock

{% set container = 'redef_catalinker_container' %}
{% set ports = ["4567/tcp"] %}
{% set environment = {'SERVICES_PORT': "http://{0}:{1}".format(pillar['redef']['services']['host'], pillar['redef']['services']['port']) }  %}
{% set port_bindings = {'4567/tcp': { 'HostIp': pillar['redef']['catalinker']['binding'], 'HostPort': pillar['redef']['catalinker']['port'] } } %}

{% include 'docker-run.sls-fragment' %}
