koha:
  saltfiles: salt://koha/files
  filerepo: http://datatest.deichman.no/saltfiles/koha/
  koha-image-tag: 3c6e7703fdde80f55d0514c0e167ffd6e7ba5e37
  opac:
    binding: 0.0.0.0
    port: 8080
  intra:
    binding: 0.0.0.0
    port: 8081
    plack_port: 8082
