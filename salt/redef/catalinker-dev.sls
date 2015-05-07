{% set container = 'redef_catalinker_container' %}
{% set repo = 'digibib' %}
{% set image = 'redef-catalinker' %}
{% set tag = pillar['redef']['image-tag'] %}
{% set ports = ["4567/tcp"] %}
{% set environment = {'SERVICES_PORT': "http://{0}:{1}".format(pillar['redef']['services']['host'], pillar['redef']['services']['port']) }  %}
{% set port_bindings = {'4567/tcp': { 'HostIp': pillar['redef']['catalinker']['binding'], 'HostPort': pillar['redef']['catalinker']['port'] } } %}

{% set force_pull = tag == 'latest' %}

{{ image }}_pulled:
  docker.pulled:
    - name: {{ repo }}/{{ image }}:{{ tag }}
    - force: {{ force_pull }}

{{ container }}_stop_if_old:
  cmd.run:
    - name: docker stop {{ container }} || true # Next line baffling? http://jinja.pocoo.org/docs/dev/templates/#escaping - Note: egrep-expression must yield single line
    - unless: docker inspect --format "{{ '{{' }} .Image {{ '}}' }}" {{ container }} | grep $(docker images | egrep "{{ repo }}/{{ image }}[[:space:]]+{{ tag }}[[:space:]]+" | awk '{ print $3 }')
    - require:
      - docker: {{ image }}_pulled

{{ container }}_remove_if_old:
  cmd.run:
    - name: docker rm {{ container }} || true
    - unless: docker inspect --format "{{ '{{' }} .Image {{ '}}' }}" {{ container }} | grep $(docker images | egrep "{{ repo }}/{{ image }}[[:space:]]+{{ tag }}[[:space:]]+" | awk '{ print $3 }')
    - require:
      - cmd: {{ container }}_stop_if_old

{{ container }}_installed:
  docker.installed:
    - name: {{ container }}
    - image: {{ repo }}/{{ image }}:{{ tag }}
    - ports: {{ ports }}
    - environment: {{ environment }}
    - require:
      - docker: {{ image }}_pulled

{{ container }}_running:
  docker.running:
    - container: {{ container }}
    - port_bindings: {{ port_bindings }}
    - watch:
      - docker: {{ container }}_installed
