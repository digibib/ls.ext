# PILLAR TOP
base:
  'nodename:vm-ship':
    - match: grain

  'P@nodename:vm-(ext|ship)':
    - match: compound
    - koha
    - koha.admin

  'nodename:vm-devops':
    - match: grain
    - kibana

