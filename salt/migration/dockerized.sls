

migration_docker_image:
  cmd.run:
    - unless: "docker images | grep 'deichman/migration' | grep {{ pillar['migration']['image-tag'] }}"
    - name: docker login --email="digitalutvikling@gmail.com" --password="{{ pillar['migration']['deichman-at-docker-hub-password'] }}" --username="deichman" && docker pull deichman/migration:{{ pillar['migration']['image-tag'] }}

# Couldn't get this more idiomatic version to work:
#  module.run:
#    - name: docker.login
#    - url: https://index.docker.io/v1/
#    - username: deichman
#    - password: {{ pillar['migration']['deichman-at-docker-hub-password'] }}
#    - email: digitalutvikling@gmail.com
#  docker.pulled:
#    - name: deichman/migration
#    - tag: {{ pillar['migration']['image-tag'] }}
#    - force: True
