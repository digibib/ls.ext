{% set mapping_path = "/vagrant/salt/redef/elasticsearch/config/mappings" %}
mappings:
  cmd.run:
    - cwd: {{ mapping_path }}
    - name: >
            for mapping in *; do
            curl --connect-timeout 10 --max-time 20 --retry 5 --retry-delay 10 --retry-max-time 120
            -XDELETE "http://{{ pillar['redef']['elasticsearch']['host']}}:{{ pillar['redef']['elasticsearch']['http']['port']}}/${mapping%.*}";
            curl -XPOST
            "http://{{ pillar['redef']['elasticsearch']['host']}}:{{ pillar['redef']['elasticsearch']['http']['port']}}/${mapping%.*}"
            -d @$mapping; done
    - require:
      - docker: elasticsearch_container_running
