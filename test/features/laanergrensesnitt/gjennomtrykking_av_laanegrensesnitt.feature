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
    Så skal jeg kun se treff med valgte format tilgjengelig
    Når jeg trykker fremover i nettleseren
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
    Når jeg søker på "prefix2" (+ id på vilkårlig migrering)
    Så skal jeg få "1" treff
    Og nåværende søketerm skal være "prefix2" (+ id på vilkårlig migrering)
    Når jeg søker på "pubprefix0" (+ id på vilkårlig migrering)
    Så skal tittel prefikset "pubprefix0" og som inneholder "nob" vises
    Når jeg søker på "pubprefix1" (+ id på vilkårlig migrering)
    Så skal tittel prefikset "pubprefix1" og som inneholder "eng" vises
