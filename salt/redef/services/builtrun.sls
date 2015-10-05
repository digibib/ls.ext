{% set repo = 'digibib' %}
{% set image = 'redef-services' %}
{% set tag = pillar['GITREF'] if pillar['GITREF'] is defined else 'latest' %}
{% set build_context = '/vagrant/redef/services' %}
{% set dockerfile = 'Dockerfile' %}

{% set container = 'redef_services_container' %}

{{ image }}_gradle_oneJar:
  cmd.run:
  - name: ./gradlew --no-daemon build oneJar
  - cwd: {{ build_context }}
  - user: vagrant
  - require_in:
    - docker: {{ image }}_built
    - cmd: {{ container }}_stop_if_old

{% include 'docker-build.sls-fragment' %}

{% set ports = ['8005/tcp'] %}
{% set environment = { 'KOHA_PORT': "http://{0}:{1}".format(pillar['redef']['koha']['host'], pillar['redef']['koha']['port_intra']),
                       'KOHA_USER': pillar['koha']['adminuser'],
                       'KOHA_PASSWORD': pillar['koha']['adminpass'],
                       'FUSEKI_PORT': "http://{0}:{1}".format(pillar['redef']['fuseki']['host'], pillar['redef']['fuseki']['port']),
                       'DATA_BASEURI': pillar['redef']['services']['baseuri'],
                       'ELASTICSEARCH_URL' : "http://{0}:{1}".format(pillar['redef']['elasticsearch']['host'], pillar['redef']['elasticsearch']['http']['port'])} %}
{% set port_bindings = {'8005/tcp': { 'HostIp': pillar['redef']['services']['binding'], 'HostPort': pillar['redef']['services']['port'] } } %}


{% include 'docker-run.sls-fragment' %}
