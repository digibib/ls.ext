clear_client:
  cmd.run:
    - name: cd /vagrant/redef/catalinker/server/lib/public && find . -mindepth 1 -maxdepth 1 -type d -exec rm -rf '{}' \; && find ! -name '.gitkeep' -type f -exec rm -f '{}' \;

build_client:
  cmd.run:
    - name: rsync -avz /vagrant/redef/catalinker/client/public/ /vagrant/redef/catalinker/server/lib/public/
    - require:
      - cmd: clear_client
