##########
# MYSQL
##########

install_mysql_server:
  pkg.installed:
    - pkgs:
      - mysql-client
      - mysql-server
    - skip_verify: True

mysqlrepl1:
  file.replace:
    - name: /etc/mysql/my.cnf
    - pattern: max_allowed_packet.+$
    - repl: max_allowed_packet = 64M
    - require:
      - pkg: install_mysql_server

mysqlrepl2:
  file.replace:
    - name: /etc/mysql/my.cnf
    - pattern: wait_timeout.+$
    - repl: wait_timeout = 6000
    - require:
      - pkg: install_mysql_server

mysql:
  service:
    - running
    - require:
      - pkg: install_mysql_server
    - watch:
      - file: /etc/mysql/my.cnf