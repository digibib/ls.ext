# encoding: UTF-8
# language: no

@redef
Egenskap: Legg til verk med tittel
  Som katalogisator
  For at en låner skal kunne finne et verk med kjent tittel
  Ønsker jeg å registrere at et verk har en tittel

  Bakgrunn:
    Gitt at jeg er i katalogiseringsgrensesnittet

  Scenario: Katalogisator legger til nytt verk
    Når jeg vil legge til et nytt verk
    Så leverer systemet en ny ID for det nye verket
    Og jeg kan legge til tittel for det nye verket
    Og grensesnittet viser at tittelen er lagret

  Scenario: Katalogisator legger inn tittel for et verk
    Gitt at systemet har returnert en ny ID for det nye verket
    Når jeg legger til tittel for det nye verket
    Så viser systemet at tittel på verket har blitt registrert
    Og verkets tittel vises på verks-siden

  Scenario: Katalogisator legger inn alternativ tittel på et verk
    Gitt at det finnes et verk
    Og at verket har en tittel
    Når jeg legger til en inn alternativ tittel på det nye verket
    Så viser systemet at alternativ tittel på verket har blitt registrert
    Og verkets alternative tittel vises på verks-siden

  @wip
  Scenario: Katalogisator legger språkinformasjon på tittel
    Gitt at det finnes et verk
    Og at verket har en tittel
    Når jeg velger språk for tittelen
    Så viser systemet at språket til tittelen blitt registrert
    Og språket til verkets tittel vises på verks-siden

  @wip
  Scenario: Katalogisator møter et system som feiler
    Gitt at det er en feil i systemet for katalogisering
    Når jeg forsøker å registrere ett nytt verk
    Så får jeg beskjed om at noe er feil
