# encoding: UTF-8
# language: no

@redef
@check-for-errors
@wip
Egenskap: Endre eksisterende verk
  Som katalogisator
  For å kunne rette en feil verksopplysning
  Ønsker jeg å kunne åpne verket for redigering og rette feilen

  Scenario: Katalogisator redigerer eksisterende verk
   Gitt at det finnes et verk med feil årstall
   Når jeg åpner verket for redigering
   Og når jeg endrer årstall for førsteutgave til verket
   Så viser systemet at årstall for førsteutgave av verket har blitt registrert
   Og verkets årstall førsteutgave av vises på verks-siden
