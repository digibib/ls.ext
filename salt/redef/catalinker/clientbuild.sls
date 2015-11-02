clear_client:
  cmd.run:
    - name: cd /vagrant/redef/catalinker/server/lib/public && find . -mindepth 1 -maxdepth 1 -type d -exec rm -rf '{}' \; && find ! -name '.gitkeep' -type f -exec rm -f '{}' \;

fetch_requirejs:
  file.managed:
    - name: /vagrant/redef/catalinker/client/lib/require.js
    - source: http://requirejs.org/docs/release/2.1.19/minified/require.js
    - source_hash: md5=e9cc5add315ba7fb5e93c4c9a6a6b7fa

fetch_ractive:
  file.managed:
    - name: /vagrant/redef/catalinker/client/lib/ractive.min.js
    - source: http://cdn.ractivejs.org/0.7.3/ractive.min.js
    - source_hash: md5=8e9c737dfa1343881d724403d5c295b7

build_client:
  cmd.run:
    - name: cp /vagrant/redef/catalinker/client/{lib/*,src/*} /vagrant/redef/catalinker/server/lib/public/
    - require:
      - cmd: clear_client
      - file: fetch_requirejs
      - file: fetch_ractive
