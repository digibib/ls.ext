redef_catalinker_docker_image:
  docker.pulled:
    - name: digibib/redef-catalinker:{{ pillar['redef']['image-tag'] }}
    - force: True

redef_patron_client_docker_image:
  docker.pulled:
    - name: digibib/redef-patron-client:{{ pillar['redef']['image-tag'] }}
    - force: True

redef_services_docker_image:
  docker.pulled:
    - name: digibib/redef-services:{{ pillar['redef']['image-tag'] }}
    - force: True

fuseki_docker_image:
  docker.pulled:
    - name: fisch42/fuseki:latest
    - force: True
