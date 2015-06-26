# encoding: UTF-8
# language: no

@wip @redef @xvfb
Egenskap: Legg til verk med dato
  Som katalogisator
  For at en låner skal kunne finne et verk med kjent årstall for førsteutgave
  Ønsker jeg å registrere at et verk har et årstall

  Bakgrunn:
    Gitt at jeg er i katalogiseringsgrensesnittet

  Scenario: Katalogisator legger inn årstall for førsteutgave av et verk
   Gitt at systemet har returnert en ny ID for det nye verket
   Når jeg legger til et årstall for førsteutgave av nye verket
   Så viser systemet at årstall for førsteutgave av verket har blitt registrert
   Og verkets årstall førsteutgave av vises på verks-siden