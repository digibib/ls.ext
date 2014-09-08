# PILLAR TOP
base:
  'nodename:ls-db':
    - match: grain

  'P@nodename:ls-(ext|db)':
    - match: compound
    - koha
    - koha.admin

  'nodename:ls-devops':
    - match: grain
    - kibana

