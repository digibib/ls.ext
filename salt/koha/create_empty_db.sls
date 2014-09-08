python-mysqldb:
  pkg.installed

koha_db_user_{{ pillar['koha']['adminuser'] }}:
  mysql_user.present:
    - host: 192.168.50.10 # Where can this user connect from
    - name: {{ pillar['koha']['adminuser'] }}
    - password: {{ pillar['koha']['adminpass'] }}
    - require:
      - pkg: python-mysqldb

koha_db_create_{{ pillar['koha']['instance'] }}:
  module.run:
    - name: mysql.db_create
    - m_name: koha_{{ pillar['koha']['instance'] }}

koha_db_grant_on_{{ pillar['koha']['instance'] }}:
  module.run:
    - name: mysql.grant_add
    - grant: 'ALL PRIVILEGES'
    - database: koha_{{ pillar['koha']['instance'] }}.*
    - user: {{ pillar['koha']['adminuser'] }}
    - host: 192.168.50.10 # Where can this user do this from
    - escape: False

koha_webinstaller_db_grant_on_{{ pillar['koha']['instance'] }}:
  module.run:
    - name: mysql.grant_add
    - grant: 'ALL PRIVILEGES'
    - database: koha_{{ pillar['koha']['instance'] }}.*
    - user: {{ pillar['koha']['adminuser'] }}
    - host: 192.168.50.12 # Koha Webinstaller needs this connection
    - escape: False
