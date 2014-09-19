# encoding: UTF-8
# language: no

@wip
Egenskap: Utlån av bok
  Som en låner Knut
  For å kunne lære om Oslo kommunes utsmykkinger
  Ønsker jeg å kunne låne boken Fargelegg byen!
  
  Bakgrunn:
    Gitt at jeg er logget inn som adminbruker
    Og at "Fargelegg byen!" er ei bok som finnes i biblioteket

  @wip
  Scenario: Eksisterende bruker som låner bok han har funnet
    Gitt at "Knut" eksisterer som en låner
    Og at "Knut" har funnet boken
    Når "Knut" vil registrere lånet
    Så registrerer systemet at "Fargelegg byen" er utlånt
    Og at "Knut" låner "Fargelegg byen"

  @wip
  Scenario: Ny bruker som låner bok som finnes
    Gitt at "Knut" vil registrere seg som en låner
    Og at "Knut" har funnet boken
    Når "Knut" vil registrere lånet
    Så registrerer systemet at "Fargelegg byen" er utlånt
    Og at "Knut" låner "Fargelegg byen"

