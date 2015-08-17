koha:
  saltfiles: salt://koha/files
  filerepo: http://datatest.deichman.no/saltfiles/koha/
  koha-image-tag: 58c7a53bc3eb6bedb09f78d01b150f52846228bb
  opac:
    binding: 0.0.0.0
    port: 8080
  intra:
    binding: 0.0.0.0
    port: 8081
    plack_port: 8082
