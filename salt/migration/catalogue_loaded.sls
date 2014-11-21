
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

load_catalogue:
  cmd.run:
    - name: echo "load_catalogue"
    - require:
      - cmd: prepare_catalogue

update_biblioitemnumber:
  cmd.run:
    - name: echo "update_biblioitemnumber"
    - require:
      - cmd: load_catalogue

prepare_emarc:
  cmd.run:
    - name: echo "prepare_load_of_emarc"
    - require:
      - cmd: update_biblioitemnumber

load_emarc:
  cmd.run:
    - name: echo "load_emarc"
    - require:
      - cmd: prepare_emarc
