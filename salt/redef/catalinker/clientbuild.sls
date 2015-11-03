clear_client:
  cmd.run:
    - name: cd /vagrant/redef/catalinker/server/lib/public && find . -mindepth 1 -maxdepth 1 -type d -exec rm -rf '{}' \; && find ! -name '.gitkeep' -type f -exec rm -f '{}' \;

test_client:
  cmd.run:
    - name: cd /vagrant/redef/catalinker/ && make test-client
    - require:
      - cmd: clear_client

add_client_files:
  cmd.run:
    - name: rsync -avz /vagrant/redef/catalinker/client/public/ /vagrant/redef/catalinker/server/lib/public/
    - require:
      - cmd: test_client
