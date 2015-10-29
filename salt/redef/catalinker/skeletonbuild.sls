{% set repo = 'digibib' %}
{% set image = 'redef-catalinker-skeleton' %}
{% set tag = 'latest' %}
{% set build_context = '/vagrant/redef/catalinker/server' %}
{% set dockerfile = 'Dockerfile-skeleton' %}

{% include 'docker-build.sls-fragment' %}

copy_skeleton_gemfile_lock:
  cmd.wait:
    - name: docker run --rm {{ repo }}/{{ image }} "cat /usr/src/Gemfile.lock" > /vagrant/redef/catalinker/server/Gemfile.lock
    - watch:
      - cmd: {{ image }}_built
