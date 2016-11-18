# encoding: UTF-8
# language: no

Egenskap: Min Side
  Som bruker
  Ønsker jeg å kunne se og endre personlige opplysninger og innstillinger

  Scenario: Se og redigere personopplysninger
    Gitt at jeg er logget inn som adminbruker
    Og at det finnes en låner med passord
    Og at jeg er i søkegrensesnittet
    Når jeg går til Min Side
    Så skal jeg se innloggingsvinduet
    Når jeg logger inn
    Og jeg trykker på personopplysninger
    Når jeg trykker på endre personopplysninger
    Så skal jeg se et skjema med personopplysninger
    Og jeg sjekker om epost og mobil/telefon valideres riktig
    Og jeg sjekker om postnummer valideres riktig
    Og jeg tester adresse for påkrevd og XSS
    Og jeg sjekker at poststed valideres riktig
    Og jeg fyller ut personopplysningene mine riktig
    Og jeg trykker på lagre personopplysninger
    Så skal jeg se personopplysningene mine
