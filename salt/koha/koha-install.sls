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

{% set exists = salt['cmd.run']("id -u " ~ pillar['koha']['instance'] ~ "-koha >/dev/null 2>&1") %}
# Create instance user and empty database if not already existant
createkohadb:
  cmd.run:
    - unless: {{ exists }}
    - name: koha-create --create-db {{ pillar['koha']['instance'] }}

default_schema:
  cmd.run:
    - unless: {{ exists }}
    - name: koha-mysql {{ pillar['koha']['instance'] }} < /usr/share/koha/intranet/cgi-bin/installer/data/mysql/kohastructure.sql
    - watch:
      - cmd: createkohadb

default_sysprefs:
  cmd.run:
    - unless: {{ exists }}
    - name: koha-mysql {{ pillar['koha']['instance'] }} < /usr/share/koha/intranet/cgi-bin/installer/data/mysql/sysprefs.sql
    - watch:
      - cmd: createkohadb

# Norwegian variants found in /usr/share/koha/intranet/cgi-bin/installer/data/mysql/nb-NO/1-Obligatorisk/
default_sysprefs_norwegian:
  cmd.run:
    - unless: {{ exists }}
    - name: koha-mysql {{ pillar['koha']['instance'] }} < /usr/share/koha/intranet/cgi-bin/installer/data/mysql/nb-NO/1-Obligatorisk/system_preferences.sql
    - watch:
      - cmd: createkohadb

########
# UPDATE DATABASE SCHEME
# Update koha syspref 'Version' manually, needed to bypass webinstaller
# Update database if not up to date with koha-common version
# Should not run it already up to date
########


# If run, always return true, as database updates will generate many errors
update_database:
  {% set kohaversion = salt['cmd.run']("perl -e 'require \"/usr/share/koha/intranet/cgi-bin/kohaversion.pl\" ; print kohaversion();'") %}
  {% set kohaversionnum = kohaversion.replace('.','')[:-3] %}
  {% set debianversion = salt['cmd.run']("dpkg -l | awk '$2==\"koha-common\" { print $3 }'") %}
  {% set debianversionnum = debianversion.replace('.','') %}
  {% set kohadbversionold = salt['cmd.run']("echo -n \"SELECT value as '' FROM systempreferences WHERE variable = 'Version';\" | sudo koha-mysql knakk | tail -1") %}
  {% set kohadbversionnew = ''.join(kohaversion.rsplit('.', 2)) %}
  {% set uptodate = kohadbversionold and kohadbversionold == kohadbversionnew %}
  cmd.run:
    - unless: {{ uptodate }}
    - name: koha-upgrade-schema {{ pillar['koha']['instance'] }} || true

update-koha-dbversion:
  cmd.run:
    - unless: {{ uptodate }}
    - name: >
        echo "INSERT INTO systempreferences (variable,value,options,explanation,type)
        VALUES ('Version','{{ kohadbversionnew }}',NULL,'The Koha database version. WARNING: Do not change 
        this value manually, it is maintained by the webinstaller',NULL)
        ON DUPLICATE KEY UPDATE value = '{{ kohadbversionnew }}' ;" | koha-mysql {{ pillar['koha']['instance'] }}
    - watch:
      - cmd: update_database
