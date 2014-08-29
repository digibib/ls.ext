Europe/Oslo:
  timezone.system:
    - utc: True

install_common_pkgs:
  pkg.installed:
    - pkgs:
      - language-pack-nb
      - openssh-server
    - skip_verify: True