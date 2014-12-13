dockerpy-prereqs:
  pkg.installed:
    - pkgs:
      - python-apt
      - git
      - python-pip

dockerpy:
  pip.installed:
    - name: docker-py
    - repo: git+https://github.com/dotcloud/docker-py.git
    - require:
      - pkg: dockerpy-prereqs

docker-dependencies:
   pkg.installed:
    - pkgs:
      - iptables
      - ca-certificates
      - lxc

docker_repo:
    pkgrepo.managed:
      - repo: 'deb http://get.docker.io/ubuntu docker main'
      - file: '/etc/apt/sources.list.d/docker.list'
      - key_url: salt://common/docker.pgp
      - require_in:
          - pkg: lxc-docker

lxc-docker:
  pkg.installed:
    - version: "1.4.0"
    - require:
      - pkg: docker-dependencies

docker:
  service.running
