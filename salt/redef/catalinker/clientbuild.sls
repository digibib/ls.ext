clear_client:
  cmd.run:
    - name: cd /vagrant/redef/catalinker/server/lib/public && find . -mindepth 1 -maxdepth 1 -type d -exec rm -rf '{}' \; && find ! -name '.gitkeep' -type f -exec rm -f '{}' \;

fetch_deps:
  cmd.run:
    - name: wget -N http://requirejs.org/docs/release/2.1.19/minified/require.js -P /vagrant/redef/catalinker/client/lib/
    - name: wget -N http://cdn.ractivejs.org/edge/ractive.min.js -P /vagrant/redef/catalinker/client/lib/

build_client:
  cmd.run:
    - name: cp /vagrant/redef/catalinker/client/{lib/*,src/*} /vagrant/redef/catalinker/server/lib/public/
    - require:
      - cmd: fetch_deps
      - cmd: clear_client
