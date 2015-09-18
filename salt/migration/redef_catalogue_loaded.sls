
prepare_catalogue:
  cmd.run:
    - name: docker run
              -e "MYSQLPASS={{ pillar['koha']['adminpass'] }}"
              -e "MYSQLUSER={{ pillar['koha']['adminuser'] }}"
              -e "KOHAINSTANCE={{ pillar['koha']['instance'] }}"
              -e "MYSQLHOST=db"
              -v "{{ pillar['migration-data-folder'] }}:/migration/data"
              --link koha_mysql_container:db
              deichman/migration:{{ pillar['migration']['image-tag'] }}
              make --file /migration/sh/Makefile prepare_catalogue
    - failhard: True

merge_catalogue_and_exemp:
  cmd.run:
    - name: docker run
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
    - failhard: True

marc2rdf:
  cmd.run:
    - name: docker run
              -v "{{ pillar['migration-data-folder'] }}:/migration/data"
              -w "/migration/marc2rdf"
              deichman/migration:{{ pillar['migration']['image-tag'] }}
              ruby marc2rdf.rb -i /migration/data/out.marcxml -o ../data/converted
    - require:
      - cmd: merge_catalogue_and_exemp
    - failhard: True

post_records_to_services:
  cmd.run:
    - name: /vagrant/salt/migration/files/postrecords.sh -d /var/migration_workdir/converted -n "{{ pillar['redef']['services']['host'] }}:{{ pillar['redef']['services']['port'] }}"
    - require:
      - cmd: marc2rdf
    - failhard: True

prepare_emarc:
  cmd.run:
    - name: docker run
            -e "MYSQLPASS={{ pillar['koha']['adminpass'] }}"
            -e "MYSQLUSER={{ pillar['koha']['adminuser'] }}"
            -e "KOHAINSTANCE={{ pillar['koha']['instance'] }}"
            -e "MYSQLHOST=db"
            -v "{{ pillar['migration-data-folder'] }}:/migration/data"
            --link koha_mysql_container:db
            deichman/migration:{{ pillar['migration']['image-tag'] }}
            make --file /migration/sh/Makefile prepare_load_of_emarc
    - require:
      - cmd: post_records_to_services
    - failhard: True

load_emarc:
  cmd.run:
    - name: docker run
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
    - failhard: True
