
prepare_catalogue:
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
              make --file /migration/sh/Makefile prepare_catalogue

merge_catalogue_and_exemp:
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
              make --file /migration/sh/Makefile merge_catalogue_and_exemp
    - require:
      - cmd: prepare_catalogue

catalogue_bulkmarcimport:
  cmd.run:
    - name: docker exec koha_container /bin/sh -c "PERL5LIB=/usr/share/koha/bin KOHA_CONF=/etc/koha/sites/name/koha-conf.xml perl /usr/share/koha/bin/migration_tools/bulkmarcimport.pl -fk -d -file /var/migration_workdir/out.marcxml  -v 1 -b -m=MARCXML"
    - require:
      - cmd: merge_catalogue_and_exemp

update_biblioitemnumber:
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
            make --file /migration/sh/Makefile update_biblioitemnumber
    - require:
      - cmd: catalogue_bulkmarcimport

prepare_emarc:
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
            make --file /migration/sh/Makefile prepare_load_of_emarc
    - require:
      - cmd: update_biblioitemnumber

load_emarc:
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
            make --file /migration/sh/Makefile load_emarc
    - require:
      - cmd: prepare_emarc
