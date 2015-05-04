{% set repo = 'digibib' %}
{% set image = 'redef-services' %}
{% set tag = pillar['GITREF'] if pillar['GITREF'] is defined else 'latest' %}
{% set build_context = '/vagrant/redef/services' %}
{% set dockerfile = 'Dockerfile' %}

{{ image }}_gradle_oneJar:
  cmd.run:
  - name: ./gradlew --daemon build oneJar
  - cwd: {{ build_context }}
  - user: vagrant
  - require_in:
    - docker: {{ image }}_built

{% include 'docker-build.sls-fragment' %}

{% set container = 'redef_services_container' %}
{% set ports = ['8080/tcp'] %}
{% set environment = { 'KOHA_PORT': "http://{0}:{1}".format(pillar['redef']['koha']['host'], pillar['redef']['koha']['port']),
                       'KOHA_USER': pillar['koha']['adminuser'],
                       'KOHA_PASSWORD': pillar['koha']['adminpass'],
                       'FUSEKI_PORT': "http://{0}:{1}".format(pillar['redef']['fuseki']['host'], pillar['redef']['fuseki']['port']) } %}
{% set port_bindings = {'8080/tcp': { 'HostIp': pillar['redef']['services']['binding'], 'HostPort': pillar['redef']['services']['port'] } } %}


{% include 'docker-run.sls-fragment' %}
