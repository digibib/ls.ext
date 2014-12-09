
prepare_loan_csv:
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
              make --file /migration/sh/Makefile prepare_loan_csv
    - failhard: True

import_loans:
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
              make --file /migration/sh/Makefile import_loans
    - require:
      - cmd: prepare_loan_csv
    - failhard: True

update_loans:
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
            make --file /migration/sh/Makefile update_loans
    - require:
      - cmd: import_loans
    - failhard: True