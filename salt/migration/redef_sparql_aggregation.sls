remove_works:
  cmd.run:
    - name: docker run
            -v "{{ pillar['migration-data-folder'] }}:/migration/data"
            deichman/migration:{{ pillar['migration']['image-tag'] }}
            bash -c "sed -e 's/__HOST__/{{ pillar['redef']['services']['host'] }}:{{ pillar['redef']['services']['port'] }}/g' /sparql/000_delete_works_and_links_to_works.sparql | curl http://{{ pillar['redef']['fuseki']['host'] }}:{{ pillar['redef']['fuseki']['port'] }}/ds/update --data-urlencode update@-"
    - failhard: True

generate_works_from_publications:
  cmd.run:
    - name: docker run
            -v "{{ pillar['migration-data-folder'] }}:/migration/data"
            deichman/migration:{{ pillar['migration']['image-tag'] }}
            bash -c "sed -e 's/__HOST__/{{ pillar['redef']['services']['host'] }}:{{ pillar['redef']['services']['port'] }}/g' /sparql/001_generate_works_from_publications.sparql | curl http://{{ pillar['redef']['fuseki']['host'] }}:{{ pillar['redef']['fuseki']['port'] }}/ds/query --data-urlencode query@- > /migration/data/works_aggregated.ttl"
    - failhard: True

load_aggregated_works:
  cmd.run:
    - name: >
            docker run
            -v "{{ pillar['migration-data-folder'] }}:/migration/data" 
            deichman/migration:{{ pillar['migration']['image-tag'] }}
            bash -c "curl -X POST -H 'Content-Type: text/turtle' -d @/migration/data/works_aggregated.ttl http://{{ pillar['redef']['fuseki']['host'] }}:{{ pillar['redef']['fuseki']['port'] }}/ds/data?graph=default"
    - require:
      - cmd: generate_works_from_publications
    - failhard: True
