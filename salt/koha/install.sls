##########
# KOHA INSTALL STATE
##########

# koha-sites.conf includes port settings and MARC framework used in all new instances
/etc/koha/koha-sites.conf:
  file.managed:
    - source: {{ pillar['saltfiles'] }}/koha-sites.conf
    - template: jinja
    - context:
      ServerName: {{ pillar['koha']['instance'] }}

# admin login user/pass file
/etc/koha/passwd:
  file.managed:
    - source: {{ pillar['saltfiles'] }}/passwd
    - mode: 0600
    - template: jinja
    - context:
      ServerName: {{ pillar['koha']['instance'] }}

##########
# KOHA CREATE VANILLA INSTANCE WITH DEFAULT SCHEMAS
# Replicates web installer steps 1-3
##########

# Create instance user and empty database if not already existant
createkohadb:
  cmd.run:
    - unless: id -u {{ pillar['koha']['instance'] }}-koha >/dev/null 2>&1
    - name: koha-create --create-db {{ pillar['koha']['instance'] }}
