
copy_example_data:
  cmd.run:
    - name: docker run
              --rm
              -v "{{ pillar['migration-data-folder'] }}:/migration/data"
              deichman/migration:{{ pillar['migration']['image-tag'] }}
              cp -r /example_data_minimum/. /migration/data/
    - failhard: True