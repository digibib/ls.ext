docker-params:
  - storage-driver=aufs
  #- insecure-registry=http://10.172.2.160:4000
  - insecure-registry=http://registry-1.docker.com
  - host=tcp://0.0.0.0:2375
  - host=unix:///var/run/docker.sock
