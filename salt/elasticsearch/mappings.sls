mappings:
  cmd.run:
    - cwd: /vagrant/salt/elasticsearch/config/mappings
    - name: >
            for mapping in *; do
            wget -qO- --method=DELETE --retry-connrefused --timeout=10 --tries=50
            "http://{{ pillar['redef']['elasticsearch']['host']}}:{{ pillar['redef']['elasticsearch']['http']['port']}}/${mapping%.*}";
            wget -qO- --method=POST --retry-connrefused --timeout=10 --tries=50
            "http://{{ pillar['redef']['elasticsearch']['host']}}:{{ pillar['redef']['elasticsearch']['http']['port']}}/${mapping%.*}"
            --body-file $mapping; done
