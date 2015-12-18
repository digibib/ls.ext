include:
  - .virtuoso

migration_docker_image:
  cmd.run:
    - unless: "docker images | grep 'deichman/migration' | grep {{ pillar['migration']['image-tag'] }}"
    - name: docker login --email="digitalutvikling@gmail.com" --password="{{ pillar['migration']['deichman-at-docker-hub-password'] }}" --username="deichman" && docker pull deichman/migration:{{ pillar['migration']['image-tag'] }}
