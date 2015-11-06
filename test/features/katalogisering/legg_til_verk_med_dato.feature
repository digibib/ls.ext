# encoding: UTF-8
# language: no

@redef
Egenskap: Legg til verk med dato
  Som katalogisator
  For at en låner skal kunne finne et verk med kjent årstall for førsteutgave
  Ønsker jeg å registrere at et verk har et årstall

  Bakgrunn:
    Gitt at jeg er i katalogiseringsgrensesnittet

  Scenario: Katalogisator legger inn årstall for førsteutgave av et verk
   Gitt at jeg har lagt til en person
   Og at jeg er i katalogiseringsgrensesnittet
   Og at systemet har returnert en ny ID for det nye verket
   Og jeg legger til forfatter av det nye verket
   Når jeg legger til et årstall for førsteutgave av nye verket
   Så viser systemet at årstall for førsteutgave av verket har blitt registrert
   Og verkets årstall førsteutgave av vises på verks-siden

  Scenario: Katalogisator prøver å legge inn årstall som ikke er årstall
   Gitt at jeg har lagt til en person
   Og at jeg er i katalogiseringsgrensesnittet
   Og at systemet har returnert en ny ID for det nye verket
   Og jeg legger til forfatter av det nye verket
   Når jeg legger inn "pølsevev" i feltet for førsteutgave av verket
   Så viser systemet at "pølsevev" ikke er ett gyldig årstall
   Og ordet "pølsevev" som førsteutgave vises IKKE på verks-siden