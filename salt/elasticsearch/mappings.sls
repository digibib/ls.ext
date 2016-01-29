mappings:
  cmd.run:
    - cwd: /vagrant/salt/elasticsearch/config/mappings
    - name: >
            wget -qO- --method=DELETE --retry-connrefused --timeout=10 --tries=50
            "http://{{ pillar['redef']['elasticsearch']['host']}}:{{ pillar['redef']['elasticsearch']['http']['port']}}/search";
            wget -qO- --method=PUT --retry-connrefused --timeout=10 --tries=50
            "http://{{ pillar['redef']['elasticsearch']['host']}}:{{ pillar['redef']['elasticsearch']['http']['port']}}/search";
            wget -qO- --method=PUT --retry-connrefused --timeout=10 --tries=50
            "http://{{ pillar['redef']['elasticsearch']['host']}}:{{ pillar['redef']['elasticsearch']['http']['port']}}/search/_mapping/work"
            --body-file work_mapping.json;
            wget -qO- --method=PUT --retry-connrefused --timeout=10 --tries=50
            "http://{{ pillar['redef']['elasticsearch']['host']}}:{{ pillar['redef']['elasticsearch']['http']['port']}}/search/_mapping/person"
            --body-file person_mapping.json;
