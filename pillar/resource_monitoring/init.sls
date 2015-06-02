resource-monitoring:
  graphite-web:
    binding: 0.0.0.0
    port: 8088
  graphite-query: # query port (used by the web interface!)
    binding: 0.0.0.0
    port: 7002
  graphite-line-receiver: # the standard graphite protocol
    binding: 0.0.0.0
    port: 2003
  graphite-pickle-receiver: # the standard graphite protocol
    binding: 0.0.0.0
    port: 2004

