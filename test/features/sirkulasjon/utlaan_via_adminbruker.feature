# encoding: UTF-8
# language: no

Egenskap: Adminbruker låner ut bok
  Som adminbruker
  For å hjelpe Knut å lære om noe
  Ønsker jeg å låne ut en bok til Knut

  Bakgrunn:
    Gitt at jeg er logget inn som adminbruker
    Og at boka finnes i biblioteket
    Og at "Knut" eksisterer som en låner

  Scenario: Adminbruker låner ut bok til Knut
    Når jeg registrerer "Knut" som aktiv låner
    Og jeg registrerer utlån av boka
    Så registrerer systemet at boka er utlånt
    Og at "Knut" låner boka