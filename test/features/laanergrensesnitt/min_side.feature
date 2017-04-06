# encoding: UTF-8
# language: no

@patron_client
@redef
@kohadb
Egenskap: Min Side
  Som bruker
  Ønsker jeg å kunne se og endre personlige opplysninger og innstillinger

  Bakgrunn:
    Gitt at jeg er logget inn som superbruker
    Og at Koha er populert med 1 lånere, 0 eksemplarer og 0 reserveringer
    Og at jeg er i søkegrensesnittet
    Når jeg går til Min Side
    Så skal jeg se innloggingsvinduet

  Scenario: Se og redigere personopplysninger
    Når jeg logger inn
    Så skal jeg se at jeg er logget inn
    Når jeg trykker på personopplysninger
    Og jeg trykker på endre personopplysninger
    Så skal jeg se et skjema med personopplysninger
    Og jeg sjekker om epost og mobil/telefon valideres riktig
    Og jeg sjekker om postnummer valideres riktig
    Og jeg tester adresse for påkrevd og XSS
    Og jeg sjekker at poststed valideres riktig
    Og jeg fyller ut personopplysningene mine riktig
    Og jeg trykker på lagre personopplysninger
    Så skal jeg se personopplysningene mine

  Scenario: Bytte PIN
    Når jeg logger inn
    Og jeg går til innstillinger
    Og jeg fyller inn gammel PIN og ny PIN riktig
    Og trykker på endre PIN-kode
    Så skal jeg se at PIN-koden har blitt endret
    Når jeg logger ut
    Når jeg trykker logg inn
    Så skal jeg se innloggingsvinduet
    Og jeg logger inn med nytt passord
    Så skal jeg se at jeg er logget inn

  Scenario: Bytte kontaktinfo
    Når jeg logger inn
    Og jeg går til innstillinger
    Og jeg huker av for påminnelse om forfall på sms
    Så skal jeg se skjema for å validere kontaktopplysninger
    Når jeg endrer kontaktopplysninger
    Og jeg trykker lagre inne på innstillinger
    Så skal skjemaet for å validere kontaktopplysninger forsvinne
    Når jeg trykker på personopplysninger
    Så skal jeg se personopplysningene mine

  Scenario: Låner endrer personlige innstillinger
    Når jeg logger inn
    Og jeg går til innstillinger
    Når jeg slår på alle avkrysningsboksene inne på innstillinger
    Og jeg trykker lagre inne på innstillinger
    Og jeg trykker oppfrisk i nettleseren
    Så skal alle avkrysningsboksene være skrudd på inne på innstillinger
    Når jeg skrur av alle avkrysningsnboksene inne på innstillinger
    Og jeg trykker lagre inne på innstillinger
    Og jeg trykker oppfrisk i nettleseren
    Så skal ingen av avkrysningsboksene være skrudd på inne på innstillinger

  Scenario: Låner skriver feil passord
    Når jeg skriver inn riktig brukernavn men feil passord
    Så skal jeg se en melding om feil brukernavn og/eller passord
    Når jeg trykker oppfrisk i nettleseren
    Så skal jeg se at jeg ikke er logget inn

