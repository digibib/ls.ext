{% set mapping_path = "/vagrant/salt/redef/elasticsearch/config/mappings" %}
mappings:
  cmd.run:
    - cwd: {{ mapping_path }}
    - name: >
            for mapping in *; do
            wget --method=DELETE --retry-connrefused --timeout=10 --tries=5
            "http://{{ pillar['redef']['elasticsearch']['host']}}:{{ pillar['redef']['elasticsearch']['http']['port']}}/${mapping%.*}";
            wget --method=POST --retry-connrefused --timeout=10 --tries=5
            "http://{{ pillar['redef']['elasticsearch']['host']}}:{{ pillar['redef']['elasticsearch']['http']['port']}}/${mapping%.*}"
            --body-file $mapping; done
    - require:
      - docker: elasticsearch_container_running
