# encoding: UTF-8
# language: no

@kohadb
Egenskap: Autentisere eksterne ressurser mot Koha REST API
  For å kunne bruke Kohas tjenester utenfor Koha Intra
  Ønsker jeg å kunne autentisere via REST API

  Bakgrunn:
    Gitt at jeg er logget inn som superbruker
    Og at det finnes en bruker med følgende rettigheter:
      | borrowers     |
      | editcatalogue |
      | staffaccess   |

  Scenario: Autentiser mot Koha API
    Gitt at jeg autentiserer brukeren mot Kohas REST API
    Så gir APIet tilbakemelding med riktige brukerrettigheter
