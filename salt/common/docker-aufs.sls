
aufs_package:
  cmd.run:
    - name: apt-get install  --quiet --assume-yes linux-image-extra-$(uname -r)
    - unless: dpkg -s linux-image-extra-$(uname -r)
    - require_in:
      - pkg: lxc-docker
