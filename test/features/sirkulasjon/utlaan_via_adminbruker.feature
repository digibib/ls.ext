# encoding: UTF-8
# language: no

@kohadb
Egenskap: Superbruker låner ut bok
  Som superbruker
  For å hjelpe Knut å lære om noe
  Ønsker jeg å låne ut en bok til Knut

  Bakgrunn:
    Gitt at jeg er logget inn som superbruker
    Og at Koha er populert med 1 lånere, 1 eksemplarer og 0 reserveringer

  Scenario: Superbruker låner ut bok til Knut
    Når jeg går til lånerens side i Koha
    Og jeg registrerer utlån av boka
    Så registrerer systemet at boka er utlånt
    Og at "Knut" låner boka