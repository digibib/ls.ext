# encoding: UTF-8
# language: no

@wip
Egenskap: Adminbruker låner ut bok
  Som adminbruker
  For å hjelpe Knut å lære om Oslo kommunes utsmykkinger
  Ønsker jeg å låne ut boka Fargelegg byen! til Knut

  @wip
  Scenario: Adminbruker låner ut bok til Knut
    Gitt at jeg er logget inn som adminbruker
    Og at "Knut" eksisterer som en låner
    Og at "Fargelegg byen!" er ei bok som finnes i biblioteket
    Når jeg registrerer "Knut" som aktiv låner
    Og jeg registrerer utlån av "Fargelegg byen!"
    Så registrerer systemet at "Fargelegg byen!" er utlånt
    Og at "Knut" låner "Fargelegg byen!"