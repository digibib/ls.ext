
docker_comment_other_params:
  file.comment:
    - name: /etc/default/docker
    - regex: ^DOCKER_OPTS=\".+\"
    - require:
      - pkg: lxc-docker

docker_params_blockreplace:
  file.blockreplace:
    - name: /etc/default/docker
    - template: jinja
    - marker_start: "### DOCKER PARAMS START --DO NOT EDIT-- ###"
    - marker_end: "### DOCKER PARAMS END --DO NOT EDIT-- ###"
    - content: |
        DOCKER_OPTS="\
        {% for param in salt["pillar.get"]("docker-params", []) %}--{{param}} \
        {% else %}\
        {% endfor %}"
    - append_if_not_found: True
    - require:
      - file: docker_comment_other_params

docker_reload_with_params:
  service.running:
    - name: docker
    - watch:
      - file: docker_params_blockreplace
    - require_in:
      - service: docker
