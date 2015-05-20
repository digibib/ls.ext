redef:
  koha:
    host: 192.168.50.12
    port: 8081
  fuseki:
    host: 192.168.50.12
    binding: 0.0.0.0
    port: 3030
  services:
    host: 192.168.50.12
    binding: 0.0.0.0
    port: 8005
    baseuri: http://192.168.50.12:8005/
  patron-client:
    binding: 0.0.0.0
    port: 8000
  catalinker:
    binding: 0.0.0.0
    port: 8010
