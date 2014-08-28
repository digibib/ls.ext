# encoding: UTF-8
# language: no

Egenskap: Adminbruker låner ut bok
  Som adminbruker
  For å hjelpe Knut å lære om Oslo kommunes utsmykkinger
  Ønsker jeg å låne ut boka Fargelegg byen! til Knut

  Bakgrunn:
    Gitt at jeg er logget inn som adminbruker
    Og at det finnes en avdeling
    Og at "Fargelegg byen!" er ei bok som finnes i biblioteket
    Og at "Knut" eksisterer som en låner

  @bookCreated @libraryCreated @itemTypeCreated @userCreated @bookCheckedOut @patronCategoryCreated
  Scenario: Adminbruker låner ut bok til Knut
    Når jeg registrerer "Knut" som aktiv låner
    Og jeg registrerer utlån av "Fargelegg byen!"
    Så registrerer systemet at "Fargelegg byen!" er utlånt
    Og at "Knut" låner "Fargelegg byen!"