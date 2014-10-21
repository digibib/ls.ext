# encoding: UTF-8
# language: no

@wip
Egenskap: Liste over avdelinger
  Som adminbruker
  For å vite at alle avdelinger er registrerte
  Sjekker jeg mot en liste som gir oversikt over forventede avdelinger

  Bakgrunn:
    Gitt at jeg er logget inn som adminbruker
    Og at jeg har en liste over avdelinger
  
  @wip
  Scenario: Sjekke avdelinger
    Når jeg er på administrasjonssiden for avdelinger
    Og jeg velger å vise alle avdelinger
    Så samsvarer listen i grensesnittet med liste over avdelinger 
