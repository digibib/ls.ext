# encoding: UTF-8
# language: no

@redef
Egenskap: Legg til verk med opphavsperson
  Som katalogisator
  For at en låner skal kunne finne et verk med kjent opphavsperson
  Ønsker jeg å registrere at et verk har en opphavsperson

  Bakgrunn:
    Gitt at jeg har lagt til en person
    Og at jeg er i katalogiseringsgrensesnittet

  Scenario: Katalogisator legger inn opphavsperson for et verk
    Og at systemet har returnert en ny ID for det nye verket
    Og at verket har en tittel
    Når jeg legger til navn på forfatter av det nye verket
    Så viser systemet at opphavsperson til verket har blitt registrert
    Så vises forfatterens navn på verkssiden
