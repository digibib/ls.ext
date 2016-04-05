# encoding: UTF-8
# language: no

@redef @arbeidsflyt @check-for-errors @xvfb
Egenskap: Katalogisere i arbeidsflyt
  Som katalogisator
  Ønsker jeg å kunne katalogisere en bok

  Scenario: Verifisere resulterende utgivelse fra arbeidsflyt med eksisterende person og verk
    Gitt at jeg har en bok
    Og at det finnes et verk med forfatter
    Og jeg vil lage en ny serie
    Så leverer systemet en ny ID for den nye serien
    Og jeg kan legge inn seriens navn
    Og jeg vil lage et nytt utgivelsessted
    Så leverer systemet en ny ID for det nye utgivelsesstedet
    Og jeg kan legge inn stedsnavn og land
    Og grensesnittet viser at endringene er lagret
    Og jeg vil lage en ny utgiver
    Så leverer systemet en ny ID for den nye utgiveren
    Og jeg kan legge inn utgiverens navn
    Og grensesnittet viser at endringene er lagret
    Når jeg legger inn forfatternavnet på startsida
    Og jeg venter litt
    Så velger jeg en person fra treffliste fra personregisteret
    Og velger verket fra lista tilkoplet forfatteren
    Og bekrefter for å gå videre til bekreft verk
    Og verifiserer at verkets basisopplysninger uten endringer er korrekte
    Og bekrefter for å gå videre til beskriv verket
    Og verifiserer verkets tilleggsopplysninger uten endringer er korrekte
    Og bekrefter for å gå videre til beskriv utgivelsen
    Og legger inn opplysningene om utgivelsen
    Og at jeg skriver inn utgivelsessted i feltet for utgivelsessted og trykker enter
    Så velger jeg første utgivelsessted i listen som dukker opp
    Og at jeg skriver inn serie i feltet for serie og trykker enter
    Så velger jeg den første serien i listen som dukker opp
    Så skriver jeg inn "12" som utgivelsens nummer i serien
    Så trykker jeg på knappen for legge til serieinformasjon
    Og jeg venter litt
    Så sjekker jeg at utgivelsen er nummer "12" i serien
    Og at jeg skriver inn utgiver i feltet "Utgitt av" og trykker enter
    Så velger jeg første utgiver i listen som dukker opp
    Og bekrefter for å gå videre til biinførsler
    Og jeg legger inn navn på en person som skal knyttes til biinnførsel
    Og jeg venter litt
    Så velger jeg en person fra treffliste fra personregisteret
    Og jeg velger rollen "Komponist"
    Og velger radioknappen for "Verk" for å velge "Rollen gjelder:"
    Så trykker jeg på knappen for legge til biinnførselen
    Og jeg venter litt
    Så sjekker jeg at det finnes en biinnførsel hvor personen jeg valgte har rollen "Komponist" knyttet til "verket"
    Så trykker jeg på knappen for legge til mer
    Og jeg legger inn navn på en person som skal knyttes til biinnførsel
    Så velger jeg en person fra treffliste fra personregisteret
    Og jeg velger rollen "Fotograf"
    Og velger radioknappen for "Utgivelse" for å velge "Rollen gjelder:"
    Så trykker jeg på knappen for legge til biinnførselen
    Og jeg venter litt
    Så sjekker jeg at det finnes en biinnførsel hvor personen jeg valgte har rollen "Fotograf" knyttet til "utgivelsen"
    Så sjekker jeg at det er "2" biinnførsler totalt
    Så fjerner jeg den første biinførselen
    Så sjekker jeg at det er "1" biinnførsler totalt
    Så sjekker jeg at det finnes en biinnførsel hvor personen jeg valgte har rollen "Fotograf" knyttet til "utgivelsen"
    Så trykker jeg på knappen for å avslutte
    Og jeg åpner utgivelsen i gammelt katalogiseringsgrensesnitt
    Så jeg verifiserer opplysningene om utgivelsen
    Og at utgivelsen er tilkoplet riktig utgivelsessted
    Så vises opplysningene brukerne skal se om utgivelsen på verkssiden

  @wip
  Scenario: Verifisere resulterende utgivelse fra arbeidsflyt med eksisterende person
    Gitt at jeg har en bok
    Og at jeg har lagt til en person
    Når jeg legger inn forfatternavnet på startsida
    Så velger jeg en person fra treffliste fra personregisteret
    Og bekrefter for å gå videre til bekreft verk
    Og legger inn basisopplysningene om verket for hovedtittel og undertittel
    Og bekrefter for å gå videre til beskriv verket
    Og legger inn tilleggsopplyningene om verket for utgivelsesår og språk
    Og bekrefter for å gå videre til beskriv utgivelsen
    Og legger inn opplysningene om utgivelsen
    Og jeg åpner utgivelsen i gammelt katalogiseringsgrensesnitt
    Så jeg verifiserer opplysningene om utgivelsen
    Og jeg åpner verket i gammelt katalogiseringsgrensesnitt
    Så jeg verifiserer opplysningene om verket
    Så vises opplysningene brukerne skal se om utgivelsen på verkssiden

  @wip
  Scenario: Verifisere endring av verksopplysninger
    Gitt at jeg har en bok
    Og at det finnes et verk med forfatter
    Når jeg legger inn forfatternavnet på startsida
    Så velger jeg en person fra treffliste fra personregisteret
    Og velger verket fra lista tilkoplet forfatteren
    Og bekrefter for å gå videre til bekreft verk
    Og legger inn basisopplysningene om verket for hovedtittel og undertittel
    Og bekrefter for å gå videre til beskriv verket
    Og legger inn tilleggsopplyningene om verket for utgivelsesår og språk
    Og bekrefter for å gå videre til beskriv utgivelsen
    Og jeg åpner verket i gammelt katalogiseringsgrensesnitt
    Så jeg verifiserer opplysningene om verket

