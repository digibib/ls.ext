
copy_configuration_data:
  cmd.run:
    - name: docker run
              -v "{{ pillar['migration-data-folder'] }}:/migration/data"
              deichman/migration:{{ pillar['migration']['image-tag'] }}
              cp -r /configuration_data/. /migration/data/
    - failhard: True