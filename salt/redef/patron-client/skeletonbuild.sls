
{% set repo = 'digibib' %}
{% set image = 'redef-patron-client-skeleton' %}
{% set tag = 'latest' %}
{% set build_context = '/vagrant/redef/patron-client' %}
{% set dockerfile = 'Dockerfile-skeleton' %}

{% include 'docker-build.sls-fragment' %}

copy_graph_module:
  cmd.run:
    - name: cp /vagrant/redef/catalinker/client/src/graph.js /vagrant/redef/patron-client/lib/

/vagrant/redef/patron-client/public/ractive.min.js:
  file.managed:
    - source: http://cdn.ractivejs.org/0.7.3/ractive.min.js
    - source_hash: md5=8e9c737dfa1343881d724403d5c295b7