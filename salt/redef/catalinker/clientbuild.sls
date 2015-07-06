{% set repo = 'digibib' %}
{% set image = 'redef-catalinker-client-builder' %}
{% set tag = 'latest' %}
{% set build_context = '/vagrant/redef/catalinker/client' %}
{% set dockerfile = 'Dockerfile-clientbuilder' %}

{% include 'docker-build.sls-fragment' %}

clear_client:
  cmd.run:
    - name: cd /vagrant/redef/catalinker/server/lib/public && find . -mindepth 1 -maxdepth 1 -type d -exec rm -rf '{}' \; && find ! -name 'index.*' -type f -exec rm -f '{}' \;
    - watch:
      - cmd: {{ image }}_built

build_client:
  cmd.run:
    - name: cp /vagrant/redef/catalinker/client/app/lib.js /vagrant/redef/catalinker/server/lib/public/lib.js
    - require:
      - cmd: clear_client
