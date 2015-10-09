generate_works_from_publications:
  cmd.run:
    - name: docker run
            -v "{{ pillar['migration-data-folder'] }}:/migration/data"
            deichman/migration:{{ pillar['migration']['image-tag'] }}
            curl http://{{ pillar['redef']['fuseki']['host'] }}:{{ pillar['redef']['fuseki']['port'] }}/ds/query --data-urlencode query@sparql/work.sparql > /migration/data/aggregated/works.ttl
    - failhard: True

load_aggregated_works:
  cmd.run:
    - name: docker run
            -v "{{ pillar['migration-data-folder'] }}:/migration/data"
            deichman/migration:{{ pillar['migration']['image-tag'] }}
            curl -X PUT -H "Content-Type: text/turtle" -d @/migration/data/aggregated/works.ttl http://{{ pillar['redef']['fuseki']['host'] }}:{{ pillar['redef']['fuseki']['port'] }}/ds/data?graph=default
    - require:
      - cmd: generate_works_from_publications
    - failhard: True

