###########
# KOHA SPECIFIC CONFIG
###########

apache2:
  service.dead

/var/migration_workdir:
  file.directory:
    - user: root
    - group: root
    - dir_mode: 755
    - file_mode: 644
    - recurse:
      - user
      - group
      - mode

###########
# Services specific config
###########

services_gradle_build_docker_image:
  cmd.run:
    - name: ./gradlew -PdockerUrl={{pillar['dockerUrl']}} dockerBuildImage
    - cwd: /vagrant/redef/services
    - user: vagrant

docker_compose_up:
  cmd.run:
    - name: docker-compose up -d --force-recreate
    - cwd: /vagrant/docker-compose
    - require:
      - cmd: services_gradle_build_docker_image

