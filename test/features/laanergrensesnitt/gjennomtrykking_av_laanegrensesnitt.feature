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
    Og jeg trykker for å bytte språk

  Scenario: Se informasjon om utgivelse
    Gitt at jeg er i søkegrensesnittet
    Når jeg søker på "pubprefix0" (+ id på vilkårlig migrering)
    Og jeg trykker på første treff
    Så skal jeg se "11" utgivelser
    Når jeg trykker på utgivelsen med "Svensk" språk
    Så skal jeg se et panel med informasjon om utgivelsen
    Og den skal inneholde eksemplarinformasjonen
      | Filial                    | Hylleplass | Status        |
      | random_migrate_branchcode | placement1 | 1 av 2 ledige |
      | random_migrate_branchcode | placement2 | 0 av 1 ledige |
    Når jeg trykker for å lukke utgivelsesinformasjon
    Så skal jeg ikke se et panel med informasjon om utgivelsen
    Når jeg trykker på utgivelsen med "Dansk" språk
    Så skal jeg se et panel med informasjon om utgivelsen
    Og den skal inneholde eksemplarinformasjonen
      | Filial                    | Hylleplass | Status        |
      | random_migrate_branchcode | placement1 | 0 av 1 ledige |
    Når jeg trykker oppfrisk i nettleseren
    Så den skal inneholde eksemplarinformasjonen
      | Filial                    | Hylleplass | Status        |
      | random_migrate_branchcode | placement1 | 0 av 1 ledige |
    Når jeg trykker tilbake i nettleseren
    Så skal jeg ikke se et panel med informasjon om utgivelsen
    Når jeg trykker fremover i nettleseren
    Så den skal inneholde eksemplarinformasjonen
      | Filial                    | Hylleplass | Status        |
      | random_migrate_branchcode | placement1 | 0 av 1 ledige |

  Scenario: Se utgivelse med deler
    Gitt at jeg er i søkegrensesnittet
    Når jeg søker på "prefix0" (+ id på vilkårlig migrering)
    Og jeg trykker på første treff
    Så skal jeg se "2" utgivelser
    Og jeg trykker på den første utgivelsen
    Så skal jeg se et panel med informasjon om utgivelsen
    Så klikker jeg på fanen "Deler av utgivelsen"
    Og den skal inneholde i riktig rekkefølge delinformasjonen
      | Deltittel                    | Hovedansvarlig | Side        |
      | På to hjul i svingen |  random_migrate_person_name | 101–200 |
      | Påfuglsommer |  random_migrate_person_name | 1–100 |
    Så trykker jeg på sorteringsknappen etter "Deltittel"
    Og den skal inneholde i riktig rekkefølge delinformasjonen
      | Deltittel                    | Hovedansvarlig | Side        |
      | Påfuglsommer |  random_migrate_person_name | 1–100 |
      | På to hjul i svingen |  random_migrate_person_name | 101–200 |
    Så trykker jeg på sorteringsknappen etter "Side"
    Så trykker jeg på sorteringsknappen etter "Side"
    Og den skal inneholde i riktig rekkefølge delinformasjonen
      | Deltittel                    | Hovedansvarlig | Side        |
      | På to hjul i svingen |  random_migrate_person_name | 101–200 |
      | Påfuglsommer |  random_migrate_person_name | 1–100 |

  Scenario: Søk etter utgivelse ut fra navn på forfatter av del
    Gitt at jeg er i søkegrensesnittet
    Når jeg søker etter forfatter av del med tittel "Påfuglsommer"
    Og jeg trykker på første treff
    Så skal jeg se "2" utgivelser
    Og jeg trykker på den første utgivelsen
    Så skal jeg se et panel med informasjon om utgivelsen
    Så klikker jeg på fanen "Deler av utgivelsen"
    Og den skal inneholde i riktig rekkefølge delinformasjonen
      | Deltittel                    | Hovedansvarlig | Side        |
      | På to hjul i svingen |  random_migrate_person_name | 101–200 |
      | Påfuglsommer |  random_migrate_person_name | 1–100 |

  Scenario: Låner reserverer bok på verkssiden
    Gitt at jeg er logget inn som adminbruker
    Og at det finnes en låner med passord
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
    Og det skal ikke være bøker klare til avhenting eller i historikk
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

  Scenario: Låner reserverer, bytter avdeling på, utsetter, aktiverer og avbestiller reservasjon
    Gitt at jeg er logget inn som adminbruker
    Og at det finnes en låner med passord
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
    Og at reservasjonen er på riktig avdeling
    Når jeg endrer avdeling
    Og jeg trykker oppfrisk i nettleseren
    Så skal reservasjonen være på ny avdeling
    Når jeg trykker på utsett reservasjon
    Så skal jeg se at reservasjonen kan aktiveres
    Når jeg trykker på fortsett reservasjon
    Så skal jeg se at reservasjonen kan utsettes
    Når jeg trykker på avbestill reservasjon
    Og jeg bekrefter at jeg skal avbestille reservasjonen
    Så skal jeg ikke ha noen reservasjoner

  Scenario: Sortering på verkssiden
    Gitt at jeg er i søkegrensesnittet
    Når jeg søker på "pubprefix0" (+ id på vilkårlig migrering)
    Og jeg trykker på første treff
    Så skal jeg se "11" utgivelser
    Og skal utgivelsene være inndelt etter medietype
    Og utgivelsene skal være sortert på språk (med norsk, engelsk, svensk og dansk først), utgivelsesår og format
