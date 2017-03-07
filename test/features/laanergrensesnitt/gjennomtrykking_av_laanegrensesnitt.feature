# encoding: UTF-8
# language: no

@patron_client
@redef
@kohadb
Egenskap: Gå gjennom lånegrensesnittet
  Som bruker av bibliotekets websider
  Skal jeg kunne søke på verk
  Og kunne reservere og låne utgaver

  Bakgrunn:
    Gitt at det finnes 1 verk med 1 utgivelser og 1 personer
    Og at Koha er populert med 1 lånere, 0 eksemplarer og 0 reserveringer
    Og at jeg er logget inn som superbruker
    Når jeg besøker bokposten
    Og jeg oppretter et eksemplar av utgivelsen

  Scenario: Låner reserverer bok på verkssiden
    Gitt at jeg er i søkegrensesnittet
    Når jeg søker på verket i lånergrensesnittet
    Og jeg finner riktig treff og trykker på det
    Og låneren trykker bestill på en utgivelse
    Så skal jeg se innloggingsvinduet
    Når jeg logger inn
    Så skal jeg se reservasjonsvinduet
    Og skal min hjemmeavdeling være forhåndsvalgt
    Og jeg trykker på bestill
    Så får låneren tilbakemelding om at boka er reservert
    Når jeg går til Lån og reservasjoner på Min Side
    Så skal jeg se reservasjonen
    Og det skal ikke være bøker klare til avhenting eller i historikk
    Når jeg finner strekkoden for et ledig eksemplar
    Og jeg er på lånerens hjemmefilial
    Og jeg leverer inn eksemplaret
    Når jeg går til Min Side
    Så skal jeg se at boka er klar til å hentes
    Når jeg låner ut boka
    Og jeg går til Min Side
    Så skal jeg se at boka er utlånt
    #Når jeg trykker på forleng lånet
    #Og jeg bekrefter at jeg skal forlenge lånet
    #Så skal jeg se en dato lenger frem i tid

  Scenario: Låner reserverer, bytter avdeling på, utsetter, aktiverer og avbestiller reservasjon
    Gitt at jeg er i søkegrensesnittet
    Når jeg søker på verket i lånergrensesnittet
    Og jeg finner riktig treff og trykker på det
    Og låneren trykker bestill på en utgivelse
    Så skal jeg se innloggingsvinduet
    Når jeg logger inn
    Så skal jeg se reservasjonsvinduet
    Og skal min hjemmeavdeling være forhåndsvalgt
    Og jeg trykker på bestill
    Så får låneren tilbakemelding om at boka er reservert
    Når jeg går til Lån og reservasjoner på Min Side
    Så skal jeg se reservasjonen
    Og at reservasjonen er på riktig avdeling
    Når jeg endrer avdeling
    Og jeg trykker oppfrisk i nettleseren
    Så skal reservasjonen være på ny avdeling
    Når jeg trykker på utsett reservasjon
    Og velger å utsette reservasjonen til gitt dato
    Så skal jeg se at reservasjonen kan aktiveres
    Og at reservasjonen får tilbakemelding om utsettelse
    Når jeg trykker på fortsett reservasjon
    Så skal jeg se at reservasjonen kan utsettes
    Når jeg trykker på avbestill reservasjon
    Og jeg bekrefter at jeg skal avbestille reservasjonen
    Så skal jeg ikke ha noen reservasjoner
    Når jeg søker på verket i lånergrensesnittet
    Og jeg finner riktig treff og trykker på det
    Og låneren trykker bestill på en utgivelse
    Så skal jeg se reservasjonsvinduet
    Og skal min sist valgte henteavdeling være forhåndsvalgt
