get_all_works:
  cmd.run:
    - name: docker run
            -v "{{ pillar['migration-data-folder'] }}:/migration/data"
            deichman/migration:{{ pillar['migration']['image-tag'] }}
            bash -c "sed -e 's/__HOST__/{{ pillar['redef']['services']['host'] }}:{{ pillar['redef']['services']['port'] }}/g' /sparql/002_get_all_work_uris.sparql | curl http://{{ pillar['redef']['triplestore']['host'] }}:{{ pillar['redef']['triplestore']['port'] }}/ds/query --data-urlencode "format=csv" --data-urlencode query@- | tail -n+2 > /migration/data/work_uris.txt"

send_work_uris_to_index:
  cmd.run:
    - name: >
            docker run
            -v "{{ pillar['migration-data-folder'] }}:/migration/data"
            deichman/migration:{{ pillar['migration']['image-tag'] }}
            bash -c "cat /migration/data/work_uris.txt | tr -d '\r' | xargs -i curl -sS -X PUT {}/index"
    - require:
      - cmd: get_all_works
    - failhard: True