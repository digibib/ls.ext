mappings:
  cmd.run:
    - name: >
            wget -qO- --method=POST --retry-connrefused --timeout=10 --tries=50
            "{{pillar['redef']['services']['baseuri']}}search/clear_index";
