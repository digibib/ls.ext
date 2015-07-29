# encoding: UTF-8
# language: no

@redef
Egenskap: Se verk
  Som bruker av bibliotekets nettsider
  Siden jeg er interessert et bestemt verk
  Ønsker se opplysninger om verket

  Scenario: Se på verksopplysninger på verkssiden
    Gitt at det finnes et verk
    Når jeg er på sida til verket
    Så ser jeg informasjon om verkets tittel og utgivelsesår

  @wip @biblioMove
  Scenario: Se på eksemplarer knyttet til verk
    Gitt at det finnes et eksemplar av en bok registrert i Koha
    Og at det finnes et verk med biblio-kobling
    Når jeg er på sida til verket
    Så ser jeg en liste over eksemplarer knyttet til verket