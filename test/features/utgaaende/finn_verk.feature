# encoding: UTF-8
# language: no

@wip
@ignore
@redef
@check-for-errors
Egenskap: Finn verk
  Som bruker av biblioteket
  For å finne et verk, ønsker jeg å kunne søke på verk

  Bakgrunn:
    Gitt at jeg har lagt til en person
    Og et verk med en utgivelse
    Og jeg åpner verket for redigering
    Og jeg legger til forfatter av det nye verket
    Og jeg søker på verket i lånergrensesnittet

  Scenario: Finn verk
    Når jeg vil finne verket i trefflista
    Og jeg klikker på det første verket
    Så ser jeg informasjon om verkets tittel og utgivelsesår

  Scenario: Ikke finn treff fra irrelevante felter
    Når jeg vil finne verket i trefflista
    Så søker jeg på verkets ID i lånergrensesnittet
    Så skal ikke verket finnes i trefflisten

  @ignore
  Scenario: Finn andre verk av samme forfatter
    Når jeg vil finne verket i trefflista
    Og jeg klikker på det første verket
    Så kommer jeg til verks-siden for det aktuelle verket
    Og jeg klikker på forfatter-linken
    Og personens navn vises på personsiden
    Så vises verket i forfatterens verkliste