Europe/Oslo:
  timezone.system:
    - utc: True

install_common_pkgs:
  pkg.installed:
    - pkgs:
      - openssh-server
      - git
    - skip_verify: True