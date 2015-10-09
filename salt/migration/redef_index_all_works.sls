get_all_works:
  cmd.run:
    - name: docker run
            -v "{{ pillar['migration-data-folder'] }}:/migration/data"
            deichman/migration:{{ pillar['migration']['image-tag'] }}
            bash -c "sed -e 's/__HOST__/{{ pillar['redef']['services']['host'] }}:{{ pillar['redef']['services']['port'] }}/g' /sparql/002_get_all_work_uris.sparql | curl http://{{ pillar['redef']['fuseki']['host'] }}:{{ pillar['redef']['fuseki']['port'] }}/ds/query --data-urlencode "format=csv" --data-urlencode query@- | tail -n+2 > /migration/data/work_uris.txt"
    - require:
      - cmd: get_all_works

send_work_uris_to_index:
  cmd.run:
    - name: >
            docker run
            -v "{{ pillar['migration-data-folder'] }}:/migration/data"
            deichman/migration:{{ pillar['migration']['image-tag'] }}
            bash -c "while read uri; do curl -X PUT $uri/index ; done < <(tr -d '\r' < /migration/data/work_uris.txt)"
    - require:
      - cmd: generate_works_from_publications
    - failhard: True