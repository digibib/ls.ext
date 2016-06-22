# encoding: UTF-8
# language: no

@redef
Egenskap: Legg til verk med tittel
  Som katalogisator
  For at en låner skal kunne finne et verk med kjent tittel
  Ønsker jeg å registrere at et verk har en tittel

  Bakgrunn:
    Gitt at jeg er i katalogiseringsgrensesnittet

  @check-for-errors
  Scenario: Katalogisator legger til nytt verk
    Når jeg vil legge til et nytt verk
    Så leverer systemet en ny ID for det nye verket
    Og jeg kan legge til tittel for det nye verket
    Og grensesnittet viser at endringene er lagret

  @check-for-errors
  Scenario: Katalogisator legger inn tittel for et verk
    Gitt at systemet har returnert en ny ID for det nye verket
    Når jeg legger til tittel for det nye verket
    Så viser systemet at tittel på verket har blitt registrert
    Og verkets tittel vises på verks-siden

  @check-for-errors
  Scenario: Katalogisator legger inn alternativ tittel på et verk
    Gitt at det finnes et verk
    Og at verket har en tittel
    Når jeg legger til en inn alternativ tittel på det nye verket
    Så viser systemet at alternativ tittel på verket har blitt registrert