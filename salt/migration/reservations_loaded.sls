
prepare_reservation_csv:
  cmd.run:
    - name: docker run
              --rm
              -e "MYSQLPASS={{ pillar['koha']['adminpass'] }}"
              -e "MYSQLUSER={{ pillar['koha']['adminuser'] }}"
              -e "KOHAINSTANCE={{ pillar['koha']['instance'] }}"
              -e "MYSQLHOST=db"
              -v "{{ pillar['migration-data-folder'] }}:/migration/data"
              --link koha_mysql_container:db
              deichman/migration:{{ pillar['migration']['image-tag'] }}
              make --file /migration/sh/Makefile prepare_reservation_csv
    - failhard: True

import_reservations:
  cmd.run:
    - name: docker run
              --rm
              -e "MYSQLPASS={{ pillar['koha']['adminpass'] }}"
              -e "MYSQLUSER={{ pillar['koha']['adminuser'] }}"
              -e "KOHAINSTANCE={{ pillar['koha']['instance'] }}"
              -e "MYSQLHOST=db"
              -v "{{ pillar['migration-data-folder'] }}:/migration/data"
              --link koha_mysql_container:db
              deichman/migration:{{ pillar['migration']['image-tag'] }}
              make --file /migration/sh/Makefile import_reservations
    - require:
      - cmd: prepare_reservation_csv
    - failhard: True