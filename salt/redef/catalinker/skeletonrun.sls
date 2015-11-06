
include:
  - .skeletonbuild

{% set container = 'redef_catalinker_skeleton_container' %}
{% set repo = 'digibib' %}
{% set image = 'redef-catalinker-skeleton' %}
{% set tag = 'latest' %}
{% set command = 'rerun ruby lib/server.rb' %}
{% set tty = true %}
{% set ports = ["4567/tcp"] %}
{% set environment = {
    'KOHA_INTRA_PORT': "http://{0}:{1}".format(pillar['redef']['koha']['host'], pillar['redef']['koha']['port_intra']),
    'KOHA_OPAC_PORT': "http://{0}:{1}".format(pillar['redef']['koha']['host'], pillar['redef']['koha']['port_opac']),
    'SERVICES_PORT': "http://{0}:{1}".format(pillar['redef']['services']['host'],pillar['redef']['services']['port']) } %}
{% set port_bindings = {'4567/tcp': { 'HostIp': pillar['redef']['catalinker']['binding'], 'HostPort': pillar['redef']['catalinker']['port'] } } %}
{% set host_volume_bindings = [ { 'host': '/vagrant/redef/catalinker/server', 'container': '/usr/src/app', 'ro': false }, { 'host': '/vagrant/redef/catalinker/client/public', 'container': '/usr/src/app/lib/public', 'ro': false } ] %}

{% include 'docker-run.sls-fragment' %}
