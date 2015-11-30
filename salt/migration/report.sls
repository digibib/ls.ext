report:
  cmd.run:
    - name: docker run
              -e "MYSQLPASS={{ pillar['koha']['adminpass'] }}"
              -e "MYSQLUSER={{ pillar['koha']['adminuser'] }}"
              -e "KOHAINSTANCE={{ pillar['koha']['instance'] }}"
              -e "MYSQLHOST=db"
              -e "FUSEKI_HOST={{ pillar['redef']['triplestore']['host'] }}"
              -e "FUSEKI_PORT={{ pillar['redef']['triplestore']['port'] }}"
              -e "SERVICES_HOST={{ pillar['redef']['services']['host'] }}"
              -e "SERVICES_PORT={{ pillar['redef']['services']['port'] }}"
              -v "{{ pillar['migration-data-folder'] }}:/migration/data"
              --link koha_mysql_container:db
              deichman/migration:{{ pillar['migration']['image-tag'] }}
              make --file /migration/sh/Makefile import_report
    - failhard: True