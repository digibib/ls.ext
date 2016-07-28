# encoding: UTF-8
# language: no

@patron_client
@random_migrate
@redef
Egenskap: Gå gjennom lånegrensesnittet
  Som bruker av bibliotekets websider
  Skal jeg kunne søke på verk
  Og kunne filtrere søkeresultatene
  Og kunne paginere søkeresultatene

  Scenario: Filtrere søkeresultater
    Gitt at jeg er i søkegrensesnittet
    Når jeg søker på "prefix1" (+ id på vilkårlig migrering)
    Så nåværende søketerm skal være "prefix1" (+ id på vilkårlig migrering)
    Når jeg søker på "prefix0" (+ id på vilkårlig migrering)
    Så nåværende søketerm skal være "prefix0" (+ id på vilkårlig migrering)
    Og skal jeg se filtre på format, språk og målgruppe
    Når jeg slår på et filter for et vilkårlig format
    Så skal filterne være valgt i grensesnittet
    Og skal jeg kun se treff med valgte format tilgjengelig
    Når jeg slår på et filter for et vilkårlig format
    Så skal filterne være valgt i grensesnittet
    Og skal jeg kun se treff med valgte format tilgjengelig
    Når jeg trykker tilbake i nettleseren
    Så nåværende søketerm skal være "prefix1" (+ id på vilkårlig migrering)
    Når jeg trykker fremover i nettleseren
    Så nåværende søketerm skal være "prefix0" (+ id på vilkårlig migrering)
    Så skal jeg kun se treff med valgte format tilgjengelig

  Scenario: Paginere søkeresultater
    Gitt at jeg er i søkegrensesnittet
    Når jeg søker på "prefix0" (+ id på vilkårlig migrering)
    Så skal jeg få "16" treff
    Og nåværende søketerm skal være "prefix0" (+ id på vilkårlig migrering)
    Når jeg går til side "1" i resultatlisten
    Så skal jeg ha "10" resultater og være på side "1"
    Og nåværende søketerm skal være "prefix0" (+ id på vilkårlig migrering)
    Når jeg går til side "2" i resultatlisten
    Så skal jeg ha "6" resultater og være på side "2"
    Og nåværende søketerm skal være "prefix0" (+ id på vilkårlig migrering)
    Når jeg trykker tilbake i nettleseren
    Så skal jeg ha "10" resultater og være på side "1"
    Og nåværende søketerm skal være "prefix0" (+ id på vilkårlig migrering)
    Når jeg trykker fremover i nettleseren
    Så skal jeg ha "6" resultater og være på side "2"
    Og nåværende søketerm skal være "prefix0" (+ id på vilkårlig migrering)
    Når jeg søker på "prefix1" (+ id på vilkårlig migrering)
    Så nåværende søketerm skal være "prefix1" (+ id på vilkårlig migrering)
    Når jeg trykker tilbake i nettleseren
    Så skal jeg ha "6" resultater og være på side "2"
    Og nåværende søketerm skal være "prefix0" (+ id på vilkårlig migrering)

  @wip
  Scenario: Vise ulike titler på verk avhengig av søketerm
    Gitt at jeg er i søkegrensesnittet
    Når jeg søker på "pubprefix0" (+ id på vilkårlig migrering)
    Så skal tittel prefikset "pubprefix0" og som inneholder "nob" vises i søkeresultatet
    Når jeg trykker på første treff
    Så skal skal tittel prefikset "pubprefix0" og som inneholder "nob" vises på verkssiden
    Når jeg søker på "pubprefix1" (+ id på vilkårlig migrering)
    Så skal tittel prefikset "pubprefix1" og som inneholder "eng" vises i søkeresultatet
    Når jeg trykker på første treff
    Så skal skal tittel prefikset "pubprefix1" og som inneholder "eng" vises på verkssiden

  Scenario: Velge språk
    Gitt at jeg er i søkegrensesnittet
    Så skal språket "Norsk" være valgt
    Og søkeknappen skal vise ordet "SØK"
    Når jeg trykker for å bytte språk
    Så søkeknappen skal vise ordet "SEARCH"
    Og skal språket "English" være valgt
    Når jeg trykker oppfrisk i nettleseren
    Så skal språket "English" være valgt
    Og søkeknappen skal vise ordet "SEARCH"

  @wip
  Scenario: Se informasjon om utgivelse
    Gitt at jeg er i søkegrensesnittet
    Når jeg søker på "pubprefix0" (+ id på vilkårlig migrering)
    Og jeg trykker på første treff
    Så skal jeg se "4" utgivelser
    Når jeg trykker på utgivelsen med "Norsk (bokmål)" språk
    Så skal jeg se et panel med informasjon om utgivelsen
    Og den skal inneholde eksemplarinformasjonen
      | Filial                    | Antall | Plassering | Status              |
      | random_migrate_branchcode | 1      | placement1 | Ledig               |
      | random_migrate_branchcode | 1      | placement1 | Utlånt              |
      | random_migrate_branchcode | 1      | placement2 | Utlånt              |
    Når jeg trykker på krysset i boksen med utgivelsesinformasjon
    Så skal jeg ikke se et panel med informasjon om utgivelsen
    Når jeg trykker på utgivelsen med "Dansk" språk
    Så skal jeg se et panel med informasjon om utgivelsen
    Og den skal inneholde eksemplarinformasjonen
      | Filial                    | Antall | Plassering | Status               |
      | random_migrate_branchcode | 1      | placement1 | Utlånt               |
    Når jeg trykker oppfrisk i nettleseren
    Så den skal inneholde eksemplarinformasjonen
      | Filial                    | Antall | Plassering | Status               |
      | random_migrate_branchcode | 1      | placement1 | Utlånt               |
    Når jeg trykker tilbake i nettleseren
    Så skal jeg ikke se et panel med informasjon om utgivelsen
    Når jeg trykker fremover i nettleseren
    Så den skal inneholde eksemplarinformasjonen
      | Filial                    | Antall | Plassering | Status               |
      | random_migrate_branchcode | 1      | placement1 | Utlånt               |

  Scenario: Logge inn på Min Side
    Gitt at jeg er logget inn som adminbruker
    Og at det finnes en låner med passord
    Og brukeren har rettigheten "superlibrarian"
    Og at jeg er i søkegrensesnittet
    Når jeg går til Min Side
    Så skal jeg se innloggingsvinduet
    Når jeg logger inn
    Og jeg trykker på personopplysninger
    Så skal jeg se informasjonen min

  Scenario: Låner reserverer bok på verkssiden
    Gitt at jeg er logget inn som adminbruker
    Og at det finnes en låner med passord
    Og brukeren har rettigheten "superlibrarian"
    Og at jeg er i søkegrensesnittet
    Når jeg søker på "pubprefix0" (+ id på vilkårlig migrering)
    Og jeg trykker på første treff
    Og låneren trykker bestill på en utgivelse
    Så skal jeg se innloggingsvinduet
    Når jeg logger inn
    Så skal jeg se reservasjonsvinduet
    Når jeg velger riktig avdeling
    Og jeg trykker på bestill
    Så får låneren tilbakemelding om at boka er reservert
    Når jeg går til Lån og reservasjoner på Min Side
    Så skal jeg se reservasjonen
    Og det skal ikke være bøker klare til avhenging eller i historikk
    Når jeg finner strekkoden for et ledig eksemplar
    Og jeg er på den opprettede filialen
    Og jeg leverer inn eksemplaret
    Når jeg går til Min Side
    Så skal jeg se at boka er klar til å hentes
    Når at jeg er på Kohas interne forside
    Og jeg låner ut boka
    Når jeg går til Min Side
    Så skal jeg se at boka er utlånt
    Når jeg trykker på forleng lånet
    Og jeg bekrefter at jeg skal forlenge lånet
    Så skal jeg se en dato lenger frem i tid

  Scenario: Låner reserverer og avbestiller reservasjon
    Gitt at jeg er logget inn som adminbruker
    Og at det finnes en låner med passord
    Og brukeren har rettigheten "superlibrarian"
    Og at jeg er i søkegrensesnittet
    Når jeg søker på "pubprefix0" (+ id på vilkårlig migrering)
    Og jeg trykker på første treff
    Og låneren trykker bestill på en utgivelse
    Så skal jeg se innloggingsvinduet
    Når jeg logger inn
    Så skal jeg se reservasjonsvinduet
    Når jeg velger riktig avdeling
    Og jeg trykker på bestill
    Så får låneren tilbakemelding om at boka er reservert
    Når jeg går til Lån og reservasjoner på Min Side
    Så skal jeg se reservasjonen
    Når jeg trykker på avbestill reservasjon
    Og jeg bekrefter at jeg skal avbestille reservasjonen
    Så skal jeg ikke ha noen reservasjoner

  Scenario: Låner endrer personlige innstillinger
    Gitt at jeg er logget inn som adminbruker
    Og at det finnes en låner med passord
    Og brukeren har rettigheten "superlibrarian"
    Og at jeg er i søkegrensesnittet
    Når jeg går til Min Side
    Så skal jeg se innloggingsvinduet
    Når jeg logger inn
    Og jeg går til innstillinger
    Når slår på alle avkrysningsboksene inne på innstillinger
    Og jeg trykker lagre inne på innstillinger
    Og jeg trykker oppfrisk i nettleseren
    Så skal alle avkrysningsboksene være skrudd på inne på innstillinger
    Når jeg skrur av alle avkrysningsnboksene inne på innstillinger
    Og jeg trykker lagre inne på innstillinger
    Og jeg trykker oppfrisk i nettleseren
    Så skal ingen av avkrysningsboksene være skrudd på inne på innstillinger
