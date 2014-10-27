

deichman_docker_hub_login:
  cmd.run:
    - name: docker login --email="digitalutvikling@gmail.com" --password="{{ pillar['deichman-at-docker-hub-password'] }}" --username="deichman"
    - requred_in:
      - cmd: migration_docker_image

migration_docker_image:
  cmd.run:
    - name: docker pull deichman/migration:{{ pillar['migration']['image-tag'] }}

# Couldn't get this more idiomatic version to work:
#  module.run:
#    - name: docker.login
#    - url: https://index.docker.io/v1/
#    - username: deichman
#    - password: {{ pillar['deichman-at-docker-hub-password'] }}
#    - email: digitalutvikling@gmail.com
#  docker.pulled:
#    - name: deichman/migration:{{ pillar['migration']['image-tag'] }}
#    - force: True
