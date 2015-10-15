{% set mapping_path = "/vagrant/salt/redef/elasticsearch/config/mappings" %}
mappings:
    cmd.run:
        - cwd: {{ mapping_path }}
        - name: >
                for mapping in *; do
                curl -XDELETE "http://{{ pillar['redef']['elasticsearch']['host']}}:{{ pillar['redef']['elasticsearch']['http']['port']}}/${mapping%.*}";
                curl -XPOST
                "http://{{ pillar['redef']['elasticsearch']['host']}}:{{ pillar['redef']['elasticsearch']['http']['port']}}/${mapping%.*}"
                -d @$mapping; done