
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

/vagrant/redef/patron-client/public/axios.min.js:
  file.managed:
    - source: https://raw.githubusercontent.com/mzabriskie/axios/master/dist/axios.min.js
    - source_hash: md5=0123388106ca6dbdab15884bfc20c91b

/vagrant/redef/patron-client/public/ractive-events-keys.js:
  file.managed:
    - source: https://raw.githubusercontent.com/ractivejs/ractive-events-keys/master/dist/ractive-events-keys.js
    - source_hash: md5=a47424451e9692a58083fcca93e2d930

/vagrant/redef/patron-client/public/ractive-load.min.js:
  file.managed:
    - source: https://raw.githubusercontent.com/ractivejs/ractive-load/master/dist/ractive-load.min.js
    - source_hash: md5=fccfb2dc3b591f0f980ea4d07e71e9e5