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
# Norwegian variants found in /usr/share/koha/intranet/cgi-bin/installer/data/mysql/nb-NO/1-Obligatorisk/
{% set exists = salt['cmd.run']("id -u {{ pillar['koha']['instance'] }}-koha >/dev/null 2>&1") %}
createkohadb:
  cmd.run:
    - unless: id -u {{ pillar['koha']['instance'] }}-koha >/dev/null 2>&1
    - name: koha-create --create-db {{ pillar['koha']['instance'] }}

default_schema:
  cmd.wait:
    - name: koha-mysql {{ pillar['koha']['instance'] }} < /usr/share/koha/intranet/cgi-bin/installer/data/mysql/kohastructure.sql
    - watch:
      - cmd: createkohadb

default_sysprefs:
  cmd.wait:
    - name: koha-mysql {{ pillar['koha']['instance'] }} < /usr/share/koha/intranet/cgi-bin/installer/data/mysql/sysprefs.sql
    - watch:
      - cmd: createkohadb

default_sysprefs_norwegian:
  cmd.wait:
    - name: koha-mysql {{ pillar['koha']['instance'] }} < /usr/share/koha/intranet/cgi-bin/installer/data/mysql/nb-NO/1-Obligatorisk/system_preferences.sql
    - watch:
      - cmd: createkohadb

########
# UPDATE DATABASE SCHEME
# Update koha syspref 'Version' manually, needed to bypass webinstaller
# Update database if not up to date with koha-common version
# Should not run it already up to date
########

# Set kohaversion from installed version of koha-common 
/usr/share/koha/intranet/cgi-bin/kohaversion.pl:
  file.exists

update-koha-dbversion:
  cmd.script:
    - source: {{ pillar['saltfiles'] }}/updatekohadbversion.sh
    - stateful: True
    - env:
      - INSTANCE: {{ pillar['koha']['instance'] }}
    - watch:
      - file: /usr/share/koha/intranet/cgi-bin/kohaversion.pl
      - cmd: createkohadb
