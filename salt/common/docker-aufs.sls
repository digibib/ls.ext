
aufs_package:
  cmd.run:
    - name: apt-get install  --quiet --assume-yes linux-image-extra-$(uname -r)
    - unless: dpkg -s linux-image-extra-$(uname -r)
    - require_in:
      - service: docker

aufs_docker_params:
  file.replace:
    - name: /etc/default/docker
    - pattern: |
        ^DOCKER_OPTS="(.*)"$
    - repl: |
        DOCKER_OPTS="--storage-driver=aufs"
    - append_if_not_found: True
    - require:
      - pkg: lxc-docker
      - cmd: aufs_package

docker_restart:
  service.running:
  - name: docker
  - require_in:
    - service: docker
  - watch:
    - file: aufs_docker_params
