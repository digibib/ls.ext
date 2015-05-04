elk:
  saltfiles: salt://elk/files
  logstash:
    image-tag: latest
  configserver:
    image-tag: 1.7.7
  busybox:
    image-tag: latest
  logforwarder:
    image-tag: latest
