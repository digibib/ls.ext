redef:
  koha:
    port_intra: 8082
    port_opac: 8080
  fuseki:
    binding: 0.0.0.0
    port: 3030
  services:
    binding: 0.0.0.0
    port: 8005
  patron-client:
    binding: 0.0.0.0
    port: 8000
  catalinker:
    binding: 0.0.0.0
    port: 8010
  elasticsearch:
    http:
      binding: 0.0.0.0
      port: 8200
    native:
      binding: 0.0.0.0
      port: 8300
