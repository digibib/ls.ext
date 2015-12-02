python-pip:
  pkg.installed:
    - unless: pip -V # if pip works leave it alone

dockerpy-prereqs:
  pkg.installed:
    - pkgs:
      - python-apt
      - git

dockerpy:
  pip.installed:
    - name: git+https://github.com/docker/docker-py.git@1.2.3
    - unless: pip freeze | grep 'docker-py==1.2.3'
    - require:
      - pkg: dockerpy-prereqs

docker-dependencies:
   pkg.installed:
    - pkgs:
      - iptables
      - ca-certificates
      - lxc
      - apt-transport-https

docker_repo:
    pkgrepo.managed:
      - repo: 'deb http://apt.dockerproject.org/repo ubuntu-trusty main'
      - file: '/etc/apt/sources.list.d/docker.list'
      - key_url: salt://common/docker.pgp
      - require_in:
          - pkg: docker-engine

docker-engine:
  pkg.installed:
    - version: "1.9.1-0~trusty"
    - require:
      - pkg: docker-dependencies

docker:
  service.running:
    - watch:
      - pkg: docker-engine
