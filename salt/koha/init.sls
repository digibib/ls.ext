##########
# KOHA Dependencies
##########

installdeps:
  pkg.installed:
    - pkgs:
      - python-software-properties
      - software-properties-common
      - libnet-ssleay-perl 
      - libcrypt-ssleay-perl
      - mysql-client
    - skip_verify: True
