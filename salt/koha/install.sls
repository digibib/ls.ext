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

########
# RUN KOHA WEBINSTALLER
# Update koha syspref 'Version' manually, needed to bypass webinstaller
# Update database if not up to date with koha-common version
# Should not run it already up to date
########
watir:
  pkg.installed:
  - pkgs:
    - ruby1.9.1-dev
    - phantomjs
  gem.installed:
    - name: watir-webdriver
    - require: 
      - pkg: watir

/tmp/KohaWebInstallAutomation.rb:
  file.managed:
    - source: {{ pillar['saltfiles'] }}/KohaWebInstallAutomation.rb


run_webinstaller:
  cmd.script:
    - source: {{ pillar['saltfiles'] }}/updatekohadbversion.sh
    - stateful: True
    - env:
      - URL: "http://192.168.50.10:8081"
      - USER: {{ pillar['koha']['adminuser'] }}
      - PASS: {{ pillar['koha']['adminpass'] }}
      - INSTANCE: {{ pillar['koha']['instance'] }}
    - watch:
      - pkg: watir
      - file: /tmp/KohaWebInstallAutomation.rb
