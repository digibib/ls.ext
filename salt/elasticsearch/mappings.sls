mappings:
  cmd.run:
    - name: >
            while [ 1 ]; do
              wget --method=POST --retry-connrefused --waitretry=1 --read-timeout=20 --timeout=15 -t 0 "{{pillar['redef']['services']['baseuri']}}search/clear_index"
              if [ $? = 0 ]; then break; fi;
              sleep 1s;
            done;