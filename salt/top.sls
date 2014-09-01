base:
  '*':
    - common
    # States to install logstash-forwarder:
    - koha.logstash-forwarder
    - koha
    - koha.apache2
    - koha.common
    - mysql-server
    - koha.sites-config
    - koha.createdb
    - koha.webinstaller
    - koha.adminuser
