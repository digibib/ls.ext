base:
  '*':
    - common

  'ls-db':
    - mysql-server
    - mysql-server.networked
    - koha.create_empty_db

  'ls-ext':
    - koha.logstash-forwarder
    - koha
    - koha.apache2
    - koha.common
    - mysql-server # need this to run createdb (which does more than create a db)
    - koha.sites-config
    - koha.createdb
    - koha.config # includes switching to db instance on ls.db
    - koha.webinstaller

  'ls-devops':
    - kibana
