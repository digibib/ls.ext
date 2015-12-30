{% set mapping_path = "/vagrant/salt/elasticsearch/config/mappings" %}
mappings:
  cmd.run:
    - cwd: {{ mapping_path }}
    - name: >
            for mapping in *; do
            wget --method=DELETE --retry-connrefused --timeout=10 --tries=5 -qO-
            "http://{{ pillar['redef']['elasticsearch']['host']}}:{{ pillar['redef']['elasticsearch']['http']['port']}}/${mapping%.*}" > /dev/null;
            wget --method=POST --retry-connrefused --timeout=10 --tries=5 -qO-
            "http://{{ pillar['redef']['elasticsearch']['host']}}:{{ pillar['redef']['elasticsearch']['http']['port']}}/${mapping%.*}"
            --body-file $mapping > /dev/null; done
