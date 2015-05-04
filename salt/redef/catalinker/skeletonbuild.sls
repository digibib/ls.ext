
{% set repo = 'digibib' %}
{% set image = 'redef-catalinker-skeleton' %}
{% set tag = 'latest' %}
{% set build_context = '/vagrant/redef/catalinker' %}
{% set dockerfile = 'Dockerfile-skeleton' %}

{% include 'docker-build.sls-fragment' %}

copy_skeleton_gemfile_lock:
  cmd.wait:
    - name: docker run --rm {{ repo }}/{{ image }} "cat /usr/src/Gemfile.lock" > /vagrant/redef/catalinker/Gemfile.lock
    - watch:
      - cmd: {{ image }}_built
