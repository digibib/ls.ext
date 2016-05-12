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
    Og jeg vil lage et nytt emne
    Så leverer systemet en ny ID for det nye emnet
    Og jeg kan legge inn emnets navn
    Og jeg vil lage et nytt sted
    Så leverer systemet en ny ID for det nye stedet
    Og jeg kan legge inn stedsnavn og land
    Og grensesnittet viser at endringene er lagret
    Og jeg vil lage en ny utgiver
    Så leverer systemet en ny ID for den nye utgiveren
    Og jeg kan legge inn utgiverens navn
    Og grensesnittet viser at endringene er lagret
    Når jeg legger inn forfatternavnet på startsida
    Og jeg venter litt
    Så sjekker jeg at trefflistens forfatterinnslag viser nasjonalitet og levetid
    Og velger verket fra lista tilkoplet forfatteren
    Og bekrefter for å gå videre til "Beskriv utgivelse"
    Og verifiserer at verkets basisopplysninger uten endringer er korrekte
    Og legger inn opplysningene om utgivelsen
    Og at jeg skriver inn sted i feltet for utgivelsessted og trykker enter
    Så velger jeg et sted fra treffliste fra stedregisteret
    Og at jeg skriver inn serie i feltet "Serie" og trykker enter
    Så velger jeg en serie fra treffliste fra serieregisteret
    Så skriver jeg inn "12" som utgivelsens nummer i serien
    Og jeg trykker på "Legg til"-knappen
    Og jeg venter litt
    Så sjekker jeg at utgivelsen er nummer "12" i serien
    Og at jeg skriver inn utgiver i feltet "Utgitt av" og trykker enter
    Så velger jeg en utgiver fra treffliste fra utgiverregisteret
    Og bekrefter for å gå videre til "Beskriv verk"
    Og verifiserer verkets tilleggsopplysninger uten endringer er korrekte
    Og bekrefter for å gå videre til "Emneopplysninger"
    Og jeg velger emnetype "Generelt" emne
    Og jeg legger inn emnet i søkefelt for emne og trykker enter
    Så velger jeg et emne fra treffliste fra emneregisteret
    Så sjekker jeg at emnet er listet opp på verket
    Og bekrefter for å gå videre til "Biinnførsler"
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
    Og jeg trykker på "Legg til"-knappen
    Og jeg venter litt
    Så sjekker jeg at det finnes en biinnførsel hvor personen jeg valgte har rollen "Fotograf" knyttet til "utgivelsen"
    Så sjekker jeg at det er "2" biinnførsler totalt
    Så fjerner jeg den første biinførselen
    Så sjekker jeg at det er "1" biinnførsler totalt
    Så sjekker jeg at det finnes en biinnførsel hvor personen jeg valgte har rollen "Fotograf" knyttet til "utgivelsen"
    Så trykker jeg på knappen for å avslutte
    Og jeg åpner utgivelsen i gammelt katalogiseringsgrensesnitt
    Så jeg verifiserer opplysningene om utgivelsen
    Og at utgivelsen er tilkoplet riktig sted
    Og at utgivelsen er tilkoplet riktig utgitt av
    Og at utgivelsen har samme hovedtittel som verket
    Og at utgivelsen har samme undertittel som verket
    Så jeg åpner verket for lesing
    Og at verket er tilkoplet riktig emne
    Så vises opplysningene brukerne skal se om utgivelsen på verkssiden

  Scenario: Opprette autoriteter underveis i katalogisering
    Gitt at jeg har en bok
    Og jeg legger inn et nytt navn på startsida
    Så får jeg ingen treff
    Og jeg trykker på "Opprett ny person"-knappen
    Så legger jeg inn fødselsår og dødsår og velger "Norsk" som nasjonalitet
    Og jeg trykker på "Opprett"-knappen
    Og jeg velger rollen "Forfatter"
    Og jeg trykker på "Legg til"-knappen
    Så legger jeg inn et verksnavn i søkefeltet for å søke etter det
    Så får jeg ingen treff
    Og jeg trykker på "Opprett nytt verk"-knappen
    Og jeg trykker på "Opprett"-knappen
    Og jeg trykker på "Legg til"-knappen
    Og jeg venter litt
    Så sjekker jeg at det finnes en hovedinnførsel hvor personen jeg valgte har rollen "Forfatter" knyttet til "verket"
    Og så trykker jeg på "Neste steg: Beskrivelse"-knappen
    Og at jeg skriver inn tilfeldig sted i feltet "Utgivelsessted" og trykker enter
    Så får jeg ingen treff
    Og jeg trykker på "Opprett nytt sted"-knappen
    Og jeg trykker på "Opprett"-knappen
    Og at jeg skriver inn tilfeldig serie i feltet "Serie" og trykker enter
    Så får jeg ingen treff
    Og jeg trykker på "Opprett ny serie"-knappen
    Og jeg trykker på "Opprett"-knappen
    Og så trykker jeg på "Neste steg: Verksopplysninger"-knappen
    Og så trykker jeg på "Neste steg: Beskriv verket"-knappen
    Så velger jeg emnetype "Generelt"
    Og at jeg skriver inn tilfeldig emne i feltet "Emne" og trykker enter
    Så får jeg ingen treff
    Og jeg trykker på "Opprett nytt generelt emne"-knappen
    Og jeg trykker på "Opprett"-knappen
    Så tar jeg en liten pause
    Og jeg trykker på "Legg til ny"-knappen
    Så tar jeg en liten pause
    Så velger jeg emnetype "Person"
    Og at jeg skriver inn tilfeldig person i feltet "Emne" og trykker enter
    Så får jeg ingen treff
    Og jeg trykker på "Opprett ny person"-knappen
    Og jeg trykker på "Opprett"-knappen
    Så tar jeg en liten pause
    Og jeg trykker på "Legg til ny"-knappen
    Så velger jeg emnetype "Verk"
    Og at jeg skriver inn tilfeldig emne i feltet "Emne" og trykker enter
    Så får jeg ingen treff
    Og jeg trykker på "Opprett nytt verk"-knappen
    Og jeg trykker på "Opprett"-knappen
    Og at jeg skriver inn tilfeldig sjanger i feltet "Sjanger" og trykker enter
    Så får jeg ingen treff
    Og jeg trykker på "Opprett ny sjanger"-knappen
    Og jeg trykker på "Opprett"-knappen

  Scenario: Redigere person i katalogisering
    Gitt at jeg vil opprette en person
    Så åpner jeg startsiden for katalogisering med fanen for vedlikehold av autoriteter
    Og at jeg skriver inn tilfeldig person i feltet "Personer" og trykker enter
    Så får jeg ingen treff
    Og jeg trykker på "Opprett ny person"-knappen
    Så legger jeg inn fødselsår og dødsår og velger "Norsk" som nasjonalitet
    Og jeg trykker på "Opprett"-knappen
    Og jeg venter litt
    Så skriver jeg inn samme tilfeldige person i feltet "Personer" og trykker enter
    Så velger jeg en person fra treffliste fra personregisteret

  Scenario: Redigere emne i katalogisering
    Gitt at jeg vil opprette et emne
    Så åpner jeg startsiden for katalogisering med fanen for vedlikehold av autoriteter
    Og at jeg skriver inn tilfeldig emne i feltet "Emner" og trykker enter
    Så får jeg ingen treff
    Og jeg trykker på "Opprett nytt generelt emne"-knappen
    Og jeg trykker på "Opprett"-knappen
    Og jeg venter litt
    Så skriver jeg inn samme tilfeldige emne i feltet "Emner" og trykker enter
    Så velger jeg et emne fra treffliste fra emneregisteret

  Scenario: Redigere sjanger i katalogisering
    Gitt at jeg vil opprette en sjanger
    Så åpner jeg startsiden for katalogisering med fanen for vedlikehold av autoriteter
    Og at jeg skriver inn tilfeldig sjanger i feltet "Sjangre" og trykker enter
    Så får jeg ingen treff
    Og jeg trykker på "Opprett ny sjanger"-knappen
    Og jeg trykker på "Opprett"-knappen
    Og jeg venter litt
    Så skriver jeg inn samme tilfeldige sjanger i feltet "Sjangre" og trykker enter
    Så velger jeg en sjanger fra treffliste fra emneregisteret

  Scenario: Redigere serie i katalogisering
    Gitt at jeg vil opprette en serie
    Så åpner jeg startsiden for katalogisering med fanen for vedlikehold av autoriteter
    Og at jeg skriver inn tilfeldig serie i feltet "Serier" og trykker enter
    Så får jeg ingen treff
    Og jeg trykker på "Opprett ny serie"-knappen
    Og jeg trykker på "Opprett"-knappen
    Og jeg venter litt
    Så skriver jeg inn samme tilfeldige serie i feltet "Serier" og trykker enter
    Så velger jeg en serie fra treffliste fra emneregisteret

  Scenario: Søke opp verk og velge riktig ut fra detaljer om forfatteren
    Gitt at det finnes et verk med forfatter
    Og at jeg legger navnet på verket inn på startsiden for arbeidsflyt og trykker enter
    Så ser jeg at det står forfatter med navn og levetid i resultatlisten
