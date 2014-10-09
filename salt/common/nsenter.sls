install-nsenter:
  cmd.run:
    - name: |
       cd /tmp
       curl https://www.kernel.org/pub/linux/utils/util-linux/v2.24/util-linux-2.24.tar.gz  | tar -zxf-
       cd util-linux-2.24
       ./configure --without-ncurses &> /dev/null
       make nsenter &> /dev/null
       cp nsenter /usr/local/bin
    - cwd: /tmp
    - timeout: 500
    - unless: test -x /usr/local/bin/nsenter

add-nsenter-function-to-shell:
  file.blockreplace:
    - name: /home/vagrant/.bashrc
    - marker_start: "# START - SALT-managed - nsenter-function - please do not edit"
    - marker_end: "# END - SALT-managed - nsenter-function" 
    - content: |
        # usage: nsenter-docker <container identifier>
        nsenter-docker() { sudo nsenter --target $(sudo docker inspect --format="{{ '{{' }}.State.Pid{{ '}}' }}" $1) --mount --uts --ipc --net --pid ; }
    - show_changes: True
    - append_if_not_found: True
