
{% set repo = 'digibib' %}
{% set image = 'redef-patron-client-skeleton' %}
{% set tag = 'latest' %}
{% set build_context = '/vagrant/redef/patron-client' %}
{% set dockerfile = 'Dockerfile-skeleton' %}

{% include 'docker-build.sls-fragment' %}

copy_graph_module:
  cmd.run:
    - name: cp /vagrant/redef/catalinker/client/src/graph.js /vagrant/redef/patron-client/lib/
