
sip_proxy_container_stop_if_old:
  cmd.run:
    - name: docker stop sip_proxy_container || true
    - unless: "docker inspect --format \"{{ '{{' }} .Image {{ '}}' }}\" sip_proxy_container | grep $(docker history --quiet --no-trunc digibib/biblio-sip2:{{ pillar['sip']['image-tag'] }} | head -n 1)"
    - require:
      - docker: biblios_sip2_docker_image

sip_proxy_container_remove_if_old:
  cmd.run:
    - name: docker rm sip_proxy_container || true
    - unless: "docker inspect --format \"{{ '{{' }} .Image {{ '}}' }}\" sip_proxy_container | grep $(docker history --quiet --no-trunc digibib/biblio-sip2:{{ pillar['sip']['image-tag'] }} | head -n 1)"
    - require:
      - cmd: sip_proxy_container_stop_if_old

sip_proxy_container_installed:
  docker.installed:
    - name: sip_proxy_container
    - image: digibib/biblio-sip2:{{ pillar['sip']['image-tag'] }} # Version MUST be in line with the one used in sip_proxy_container_stop_if_old
    - environment:
      - "USE_LOCAL_MODS": True
      - "SIPSERVER_HOST_PORT": "{{ pillar['sip']['server']['host'] }}:{{ pillar['sip']['server']['port'] }}"
    - ports:
      - "{{ pillar['sip']['proxy']['port'] }}/tcp"
    - require:
      - docker: biblios_sip2_docker_image

sip_proxy_container_running:
  docker.running:
    - container: sip_proxy_container
    - image: digibib/biblio-sip2:{{ pillar['sip']['image-tag'] }} # Version MUST be in line with the one used in sip_proxy_container_stop_if_old
    - port_bindings:
        "{{ pillar['sip']['proxy']['port'] }}/tcp":
            HostIp: "{{ pillar['sip']['proxy']['binding'] }}"
            HostPort: "{{ pillar['sip']['proxy']['port'] }}"
    - watch:
      - docker: sip_proxy_container_installed
