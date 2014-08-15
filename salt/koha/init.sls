##########
# KOHA Development server
# BASED ON UBUNTU RARING SERVER 64bit
# PACKAGES
##########

installdeps:
  pkg.installed:
    - pkgs:
      - language-pack-nb
      - openssh-server
      - python-software-properties
      - software-properties-common
      - libnet-ssleay-perl 
      - libcrypt-ssleay-perl
      - mysql-client
      - mysql-server
    - skip_verify: True

########
# APACHE
########

install_apache2:
  pkg.installed:
    - name: libapache2-mpm-itk
    - require:
      - pkg: installdeps
    - require_in:
      - pkg: apache2

apache2:
  pkg.installed

/etc/apache2/ports.conf:
  file.append:
    - text:
      - Listen 8080
      - Listen 8081
    - stateful: True
    - require:
      - pkg: apache2

apacheconfig:
  file.managed:
    - name: /etc/apache2/sites-available/{{ pillar['koha']['instance'] }}.conf
    - source: {{ pillar['saltfiles'] }}/apache.tmpl
    - template: jinja
    - context:
      OpacPort: 8080
      IntraPort: 8081
      ServerName: {{ pillar['koha']['instance'] }}
    - require:
      - pkg: apache2

sudo a2enmod rewrite:
  cmd.run:
    - require:
      - pkg: apache2

# Temporary hack to build on 14.04 due to apache mpm failure

sudo a2dismod mpm_event || true:
  cmd.run:
    - require:
      - pkg: apache2

sudo a2dismod mpm_itk || true:
  cmd.run:
    - require:
      - pkg: apache2

sudo a2dismod mpm_prefork || true:
  cmd.run:
    - require:
      - pkg: apache2

sudo a2enmod mpm_itk || true:
  cmd.run:
    - require:
      - pkg: apache2

sudo a2enmod cgi:
  cmd.run:
    - require:
      - pkg: apache2

sudo a2dissite 000-default:
  cmd.run:      
    - require:
      - pkg: apache2

apache2_service:
  service.running:
    - name: apache2
    - require:
      - pkg: apache2
      - cmd: sudo a2enmod rewrite
      - cmd: sudo a2enmod cgi
      - cmd: sudo a2dissite 000-default
      - file: /etc/apache2/ports.conf

koharepo:
  pkgrepo.managed:
    - name: deb http://debian.koha-community.org/koha squeeze main
    - key_url: http://debian.koha-community.org/koha/gpg.asc

##########
# KOHA-COMMON
##########

koha-common:
  pkg.installed:
    - skip_verify: True
    - require:
      - pkgrepo: koharepo
      - pkg: installdeps
      - pkg: install_apache2

##########
# MYSQL
##########

mysqlrepl1:
  file.replace:
    - name: /etc/mysql/my.cnf
    - pattern: max_allowed_packet.+$
    - repl: max_allowed_packet = 64M

mysqlrepl2:
  file.replace:
    - name: /etc/mysql/my.cnf
    - pattern: wait_timeout.+$
    - repl: wait_timeout = 6000

mysql:
  service:
    - running
    - require:
      - pkg: installdeps
    - watch:
      - file: /etc/mysql/my.cnf
