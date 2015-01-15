koha_restful_volume_installed:
  docker.installed:
    - name: koha_restful_container
    - image: digibib/koha-restful:{{ pillar['koha-restful']['image-tag'] }}

koha_restful_volume_run_once:
  docker.running:
  - container: koha_restful_container
  - check_is_running: False
  - require:
    - docker: koha_restful_volume_installed