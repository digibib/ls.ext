# encoding: UTF-8
# language: no

@wip @redef
Egenskap: Se verk
  Som bruker av bibliotekets nettsider
  Siden jeg er interessert et bestemt verk
  Ønsker se opplysninger om verket

  Bakgrunn:
    Gitt at det finnes en side for et verk

  @wip
  Scenario: Se på verksopplysninger på verkssiden
    Når jeg er på sida til verket
    Så ser jeg informasjon om verkets tittel og utgivelsesår

  @wip
  Scenario: Se på eksemplarer knyttet til verk
    Gitt at det finnes et eksemplar av en bok registrert i Koha
    Og at det finnes en side for et verk
    Når jeg er på sida til verket
    Så ser jeg en liste over eksemplarer knyttet til verket