# encoding: UTF-8
# language: no

Egenskap: Utlån av bok
  Som en låner Knut
  For å kunne lære om Oslo kommunes utsmykkinger
  Ønsker jeg å kunne låne boken Fargelegg byen!

  @wip
  Scenario: Eksisterende bruker som låner bok han har funnet
    Gitt at "Knut" eksisterer som en biblioteksbruker
    Og at "Fargelegg byen" er en bok som finnes i biblioteket
    Og at "Knut" har funnet boken
    Når "Knut" vil registrere lånet
    Så registrerer systemet at boken er utlånt

  @wip
  Scenario: Ny bruker som låner bok som finnes
    Gitt at "Knut" eksisterer som en biblioteksbruker
    Og at "Fargelegg byen" er en bok som finnes i biblioteket
    Og at "Knut" har funnet boken
    Når "Knut" vil registrere lånet
    Så registrerer systemet at boken er utlånt

