elk:
  saltfiles: salt://elk/files
  logstash:
    image-tag: latest
  configserver:
    image-tag: 1.9.3
    binding: 0.0.0.0
    port: 9999
  busybox:
    image-tag: latest
  logforwarder:
    image-tag: latest
  lumberjack:
    binding: 0.0.0.0
    port: 5000
  kibana:
    binding: 0.0.0.0
    port: 9292
  elasticsearch:
    binding: 0.0.0.0
    port: 9200
