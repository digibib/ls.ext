# encoding: UTF-8
# language: no

@wip @redef
Egenskap: Legg til verk med tittel
  Som katalogisator
  For at en låner skal kunne finne et verk med kjent tittel
  Ønsker jeg å registrere at et verk har en tittel

  Bakgrunn:
    Gitt at jeg er logget inn som katalogisator
    Gitt at jeg er i katalogiseringsgrensesnittet

  Scenario: Katalogisator legger til nytt verk
    Når jeg vil legge til et nytt verk
    Så leverer systemet en ny ID for det nye verket
    Og jeg kan legge til tittel for det nye verket

  Scenario: Katalogisator legger inn tittel for et verk
    Gitt at systemet har returnert en ny ID for det nye verket
    Når jeg legger til tittel for det nye verket
    Så viser systemet at tittel på verket har blitt registrert
    Og verkets tittel vises på verks-siden

  Scenario: Katalogisator legger inn opphavsperson for et verk
    Gitt at systemet har returnert en ny ID for det nye verket
    Når jeg legger til en opphavsperson for det nye verket
    Så viser systemet at opphavsperson til verket har blitt registrert
    Og verkets opphavsperson vises på verks-siden

   Scenario: Katalogisator legger inn årstall for førsteutgave av et verk
    Gitt at systemet har returnert en ny ID for det nye verket
    Når jeg legger til et årstall for førsteutgave av nye verket
    Så viser systemet at årstall for førsteutgave av verket har blitt registrert
    Og verkets årstall førsteutgave av vises på verks-siden  
    
    Scenario: Katalogisator legger inn alternativ tittel på et verk
    Gitt at det finnes et verk
    Og at verket har en tittel
    Når jeg legger til en inn alternativ tittel på det nye verket
    Så viser systemet at alternativ tittel på verket har blitt registrert
    Og verkets alternative tittel vises på verks-siden  
    
    Scenario: Katalogisator legger språkinformasjon på tittel
    Gitt at det finnes et verk
    Og at verket har en tittel
    Når jeg velger språk for tittelen
    Så viser systemet at språket til tittelen blitt registrert
    Og språket til verkets tittel vises på verks-siden  
    
    
  @wip @slettes
  Scenario: Katalogisator legger til nytt verk med tittel
    Når jeg legger inn verket som nytt verk
    Og når jeg knytter en tittel til verket
    Så viser systemet at verket har en tittel
