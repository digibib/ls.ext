docker-python-apt:
  pkg.installed:
    - name: python-apt

docker-git:
  pkg.installed:
    - name: git

docker-python-pip:
  pkg.installed:
    - name: python-pip

docker-python-dockerpy:
  pip.installed:
    - name: docker-py
    - repo: git+https://github.com/dotcloud/docker-py.git
    - require:
      - pkg: docker-python-pip

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
      - require:
        - pkg: docker-python-apt
      - require:
        - pkg: docker-python-pip

lxc-docker:
  pkg.latest:
    - require:
      - pkg: docker-dependencies

docker:
  service.running
