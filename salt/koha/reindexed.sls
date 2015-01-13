rebuildzebra:
  cmd.run:
    - name: docker exec koha_container /bin/sh -c "koha-rebuild-zebra --full --quiet {{ pillar['koha']['instance'] }}"
    - failhard: True