# encoding: UTF-8
# language: no

@redef @arbeidsflyt
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
    Og jeg vil lage en ny organisasjon
    Så leverer systemet en ny ID for den nye organisasjonen
    Og jeg kan legge inn organisasjonens navn
    Og grensesnittet viser at endringene er lagret
    Når jeg legger inn forfatternavnet på startsida
    Og jeg venter litt
    Så sjekker jeg at trefflistens forfatterinnslag viser nasjonalitet og levetid
    Og velger verket fra lista tilkoplet forfatteren
    Og jeg venter litt
    Og bekrefter for å gå videre til "Beskriv utgivelse"
    Og verifiserer at verkets basisopplysninger uten endringer er korrekte
    Og jeg venter litt
    Og legger inn opplysningene om utgivelsen
    Og jeg venter litt
    Og jeg venter litt
    Og jeg venter litt
    Og jeg venter litt
    Og jeg venter litt
    Og jeg venter litt
    Og jeg venter litt
    Og jeg venter litt
    Og jeg venter litt
    Og jeg venter litt
    Og jeg venter litt
    Og at jeg skriver inn sted i feltet for utgivelsessted og trykker enter
    Så debugger jeg
    Så velger jeg et sted fra treffliste fra stedregisteret
    Så skriver jeg inn "12" som utgivelsens nummer i serien
    Så jeg venter litt
    Og at jeg skriver inn serie i feltet "Serie" og trykker enter
    Så velger jeg en serie fra treffliste fra serieregisteret
    Så jeg venter litt
    Og jeg trykker på "Legg til"-knappen
    Og jeg venter litt
    Og jeg venter litt
    Så sjekker jeg at utgivelsen er nummer "12" i serien
    Og at jeg skriver inn utgiver i feltet "Utgitt av" og trykker enter
    Så velger jeg en organisasjon fra treffliste fra organisasjonsregisteret
    Og bekrefter for å gå videre til "Beskriv verk"
    Og verifiserer verkets tilleggsopplysninger uten endringer er korrekte
    Og bekrefter for å gå videre til "Emneopplysninger"
    Og jeg velger emnetype "Generelt" emne
    Og jeg legger inn emnet i søkefelt for emne og trykker enter
    Så velger jeg et emne fra treffliste fra emneregisteret
    Så sjekker jeg at emnet er listet opp på verket
    Og jeg venter litt
    Og jeg venter litt
    Og bekrefter for å gå videre til "Beskriv deler"
    Så velger jeg aktørtype "Organisasjon"
    Og jeg legger inn et nytt navn
    Så får jeg ingen treff
    Så trykker jeg på "Opprett ny organisasjon"-knappen
    Så trykker jeg på "Opprett"-knappen
    Og jeg velger rollen "Forfatter"
    Og at jeg skriver inn tilfeldig verksnavn i feltet "Originaltittel" og trykker enter
    Så får jeg ingen treff
    Så trykker jeg på "Opprett nytt verk"-knappen
    Så trykker jeg på "Opprett"-knappen
    Så jeg skriver verdien "Deltittel" for "Tittel på delverk"
    Så jeg venter litt
    Så jeg venter litt
    Og jeg trykker på "Legg til"-knappen
    Og jeg venter litt
    Og jeg venter litt
    Og jeg trykker på "Legg til et delverk til"-knappen
    Så velger jeg aktørtype "Person"
    Og jeg legger inn et nytt navn
    Så får jeg ingen treff
    Så trykker jeg på "Opprett ny person"-knappen
    Så legger jeg inn fødselsår og dødsår og velger "Norge" som nasjonalitet
    Så trykker jeg på "Opprett"-knappen
    Og jeg velger rollen "Forfatter"
    Og at jeg skriver inn tilfeldig verksnavn i feltet "Originaltittel" og trykker enter
    Så får jeg ingen treff
    Så trykker jeg på "Opprett nytt verk"-knappen
    Så trykker jeg på "Opprett"-knappen
    Så jeg skriver verdien "Deltittel" for "Tittel på delverk"
    Og jeg skriver verdien "1" for "Del"
    Så skriver jeg inn "10" og "20" i intervallfeltene "Sidetall"
    Så krysser jeg av i avkrysningboksen for "Skal ikke inngå i verksliste"
    Og jeg trykker på "Legg til"-knappen
    Og bekrefter for å gå videre til "Biinnførsler"
    Og jeg legger inn navn på en person som skal knyttes til biinnførsel
    Og jeg venter litt
    Så velger jeg en person fra treffliste fra personregisteret
    Og jeg velger rollen "Komponist"
    Og velger radioknappen for "Verk" for å velge "Rollen gjelder:"
    Så trykker jeg på knappen for legge til biinnførselen
    Og jeg venter litt
    Så sjekker jeg at det finnes en biinnførsel hvor personen jeg valgte har rollen "Komponist" knyttet til "verket"
    Så så trykker jeg på Legg til ny biinnførsel-knappen
    Og jeg legger inn navn på en person som skal knyttes til biinnførsel
    Og jeg venter litt
    Så velger jeg en person fra treffliste fra personregisteret
    Og jeg velger rollen "Fotograf"
    Og velger radioknappen for "Utgivelse" for å velge "hva rollen gjelder"
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
@    Så vises opplysningene brukerne skal se om utgivelsen på verkssiden

  Scenario: Slette verk
    Gitt at jeg har en bok
    Og at det finnes et verk med forfatter
    Når jeg legger inn forfatternavnet på startsida
    Og velger verket fra lista tilkoplet forfatteren
    Og jeg venter litt
    Så klikker jeg på fanen "Beskriv verk"
    Så trykker jeg på "Slett verket"-knappen
    Så trykker jeg på "Slett"-knappen i dialogen
    Og jeg venter litt
    Så trykker jeg på "Ok"-knappen i dialogen
    Så åpner jeg startsiden for katalogisering med fanen for vedlikehold av autoriteter
    Og jeg venter litt
    Og jeg skriver verdien på verkshovedtittel i feltet som heter "Verk" og trykker enter
    Så får jeg ingen treff

  Scenario: Slette utgivelse
    Gitt at jeg har en bok
    Og jeg vil lage en ny serie
    Så leverer systemet en ny ID for den nye serien
    Og jeg kan legge inn seriens navn
    Og at det finnes et verk med forfatter
    Når jeg legger inn forfatternavnet på startsida
    Og jeg venter litt
    Og velger verket fra lista tilkoplet forfatteren
    Og jeg venter litt
    Og bekrefter for å gå videre til "Beskriv utgivelse"
    Og jeg venter litt
    Og at jeg skriver inn serie i feltet "Serie" og trykker enter
    Så velger jeg en serie fra treffliste fra serieregisteret
    Så skriver jeg inn "12" som utgivelsens nummer i serien
    Og jeg trykker på "Legg til"-knappen
    Og jeg venter litt
    Så sjekker jeg at utgivelsen er nummer "12" i serien
    Så husker jeg tittelnummeret til senere
    Så åpner jeg startsiden for katalogisering med fanen for vedlikehold av autoriteter
    Og jeg venter litt
    Og jeg venter litt
    Så jeg skriver verdien på tittelnummer i feltet som heter "Utgivelser" og trykker enter
    Og jeg venter litt
    Så velger jeg en utgivelse fra treffliste fra utgivelsesindeksen
    Og jeg venter litt
    Og jeg venter litt
    Så trykker jeg på "Slett utgivelsen"-knappen
    Så trykker jeg på "Slett"-knappen i dialogen
    Så trykker jeg på "Ok"-knappen i dialogen
    Så åpner jeg startsiden for katalogisering med fanen for vedlikehold av autoriteter
    Og jeg venter litt
    Så jeg skriver verdien på tittelnummer i feltet som heter "Utgivelser" og trykker enter
    Så får jeg ingen treff

  Scenario: Opprette autoriteter underveis i katalogisering
    Gitt at jeg har en bok
    Og jeg legger inn et nytt navn på startsida
    Så får jeg ingen treff
    Så trykker jeg på "Opprett ny person"-knappen
    Så legger jeg inn fødselsår og dødsår og velger "Norge" som nasjonalitet
    Så trykker jeg på "Opprett"-knappen
    Og jeg venter litt
    Og jeg velger rollen "Forfatter"
    Så legger jeg inn et verksnavn i søkefeltet for å søke etter det
    Så får jeg ingen treff
    Så trykker jeg på "Opprett nytt verk"-knappen
    Så trykker jeg på "Opprett"-knappen
    Og jeg venter litt
    Og jeg trykker på "Legg til"-knappen
    Og jeg venter litt
    Så ombestemmer jeg meg
    Så fjerner jeg hovedinnførselen
    Og jeg venter litt
    Så velger jeg aktørtype "Organisasjon"
    Og jeg venter litt
    Og jeg venter litt
    Og jeg legger inn et nytt navn
    Så får jeg ingen treff
    Så trykker jeg på "Opprett ny organisasjon"-knappen
    Så trykker jeg på "Opprett"-knappen
    Og jeg velger rollen "Forfatter"
    Og jeg trykker på "Legg til"-knappen
    Og jeg venter litt
    Så sjekker jeg at det finnes en hovedinnførsel hvor organisasjonen jeg valgte har rollen "Forfatter" knyttet til "verket"
    Så trykker jeg på "Neste steg: Beskrivelse"-knappen
    Og at jeg skriver inn tilfeldig organisasjon i feltet "Utgitt av" og trykker enter
    Så får jeg ingen treff
    Så trykker jeg på "Opprett ny organisasjon"-knappen
    Og jeg venter litt
    Så trykker jeg på "Opprett"-knappen
    Og jeg venter litt
    Så fjerner jeg valgt verdi i feltet "Utgitt av"
    Så velger jeg aktørtype "Person"
    Og at jeg skriver inn tilfeldig person i feltet "Utgitt av" og trykker enter
    Så får jeg ingen treff
    Så trykker jeg på "Opprett ny person"-knappen
    Så trykker jeg på "Opprett"-knappen
    Og jeg venter litt
    Og at jeg skriver inn tilfeldig sted i feltet "Utgivelsessted" og trykker enter
    Så får jeg ingen treff
    Så trykker jeg på "Opprett nytt sted"-knappen
    Så trykker jeg på "Opprett"-knappen
    Og at jeg skriver inn tilfeldig serie i feltet "Serie" og trykker enter
    Så får jeg ingen treff
    Så trykker jeg på "Opprett ny serie"-knappen
    Så trykker jeg på "Opprett"-knappen
    Og jeg venter litt
    Så trykker jeg på "Neste steg: Beskriv verk"-knappen
    Så skriver jeg inn "12" som verkets nummer i serien
    Og at jeg skriver inn tilfeldig verksserie i feltet "Serie" og trykker enter
    Så får jeg ingen treff
    Så trykker jeg på "Opprett ny verksserie"-knappen
    Så trykker jeg på "Opprett"-knappen
    Og jeg venter litt
    Så trykker jeg på "Neste steg: Emneopplysninger"-knappen
    Så velger jeg emnetype "Generelt"
    Og at jeg skriver inn tilfeldig emne i feltet "Emne" og trykker enter
    Så får jeg ingen treff
    Så trykker jeg på "Opprett nytt generelt emne"-knappen
    Så trykker jeg på "Opprett"-knappen
    Så tar jeg en liten pause
    Og jeg trykker på "Legg til et emne til"-knappen
    Så tar jeg en liten pause
    Så velger jeg emnetype "Person"
    Og at jeg skriver inn tilfeldig person i feltet "Emne" og trykker enter
    Så får jeg ingen treff
    Så trykker jeg på "Opprett ny person"-knappen
    Så trykker jeg på "Opprett"-knappen
    Så tar jeg en liten pause
    Og jeg trykker på "Legg til et emne til"-knappen
    Så velger jeg emnetype "Verk"
    Og at jeg skriver inn tilfeldig emne i feltet "Emne" og trykker enter
    Så får jeg ingen treff
    Så trykker jeg på "Opprett nytt verk"-knappen
    Så trykker jeg på "Opprett"-knappen
    Og jeg venter litt
    Og at jeg skriver inn tilfeldig sjanger i feltet "Sjanger" og trykker enter
    Så får jeg ingen treff
    Så trykker jeg på "Opprett ny sjanger"-knappen
    Så trykker jeg på "Opprett"-knappen

  Scenario: Redigere person i katalogisering
    Gitt at jeg vil opprette en person
    Så åpner jeg startsiden for katalogisering med fanen for vedlikehold av autoriteter
    Og at jeg skriver inn tilfeldig person i feltet "Personer" og trykker enter
    Så får jeg ingen treff
    Så trykker jeg på "Opprett ny person"-knappen
    Så legger jeg inn fødselsår og dødsår og velger "Norsk" som nasjonalitet
    Så trykker jeg på "Opprett"-knappen
    Og jeg venter litt
    Så skriver jeg inn samme tilfeldige person i feltet "Personer" og trykker enter
    Så velger jeg en person fra treffliste fra personregisteret

  Scenario: Redigere emne i katalogisering
    Gitt at jeg vil opprette et emne
    Så åpner jeg startsiden for katalogisering med fanen for vedlikehold av autoriteter
    Og at jeg skriver inn tilfeldig emne i feltet "Emner" og trykker enter
    Så får jeg ingen treff
    Så trykker jeg på "Opprett nytt generelt emne"-knappen
    Så trykker jeg på "Opprett"-knappen
    Og jeg venter litt
    Så klikker jeg utenfor sprettopp-skjemaet
    Og jeg venter litt
    Og jeg venter litt
    Så skriver jeg inn samme tilfeldige emne i feltet "Emner" og trykker enter
    Så velger jeg et emne fra treffliste fra emneregisteret
    Så jeg skriver verdien "Beskrivelse" for "Forklarende tilføyelse"
    Så trykker jeg på "Ferdig"-knappen
    Så åpner jeg startsiden for katalogisering med fanen for vedlikehold av autoriteter
    Og jeg venter litt
    Så skriver jeg inn samme tilfeldige emne i feltet "Emner" og trykker enter
    Og jeg venter litt
    Så velger jeg et emne fra treffliste fra emneregisteret
    Og jeg venter litt
    Så sjekker jeg at verdien for "Forklarende tilføyelse" nå er "Beskrivelse"

  Scenario: Redigere sjanger i katalogisering
    Gitt at jeg vil opprette en sjanger
    Så åpner jeg startsiden for katalogisering med fanen for vedlikehold av autoriteter
    Og at jeg skriver inn tilfeldig sjanger i feltet "Sjangre" og trykker enter
    Så får jeg ingen treff
    Så trykker jeg på "Opprett ny sjanger"-knappen
    Så skriver jeg inn samme tilfeldige sjanger i feltet "Alternativt navn" og trykker enter
    Så trykker jeg på "Opprett"-knappen
    Og jeg venter litt
    Så skriver jeg inn samme tilfeldige sjanger i feltet "Sjangre" og trykker enter
    Så velger jeg en sjanger fra treffliste fra sjangerregisteret

  Scenario: Redigere serie i katalogisering
    Gitt at jeg vil opprette en serie
    Så åpner jeg startsiden for katalogisering med fanen for vedlikehold av autoriteter
    Og at jeg skriver inn tilfeldig serie i feltet "Forlagsserier" og trykker enter
    Så får jeg ingen treff
    Så trykker jeg på "Opprett ny serie"-knappen
    Så trykker jeg på "Opprett"-knappen
    Og jeg venter litt
    Så skriver jeg inn samme tilfeldige serie i feltet "Forlagsserier" og trykker enter
    Så velger jeg en serie fra treffliste fra serieregisteret

  Scenario: Redigere organisasjon i katalogisering
    Gitt at jeg vil opprette en organisasjon
    Så åpner jeg startsiden for katalogisering med fanen for vedlikehold av autoriteter
    Og at jeg skriver inn tilfeldig organisasjon i feltet "Organisasjoner" og trykker enter
    Så får jeg ingen treff
    Så trykker jeg på "Opprett ny organisasjon"-knappen
    Så skriver jeg inn samme tilfeldige organisasjon i feltet "Alternativt navn" og trykker enter
    Så trykker jeg på "Opprett"-knappen
    Og jeg venter litt
    Så skriver jeg inn samme tilfeldige organisasjon i feltet "Organisasjoner" og trykker enter
    Så velger jeg en organisasjon fra treffliste fra organisasjonsregisteret

  Scenario: Redigere hendelse i katalogisering
    Gitt at jeg vil opprette en hendelse
    Så åpner jeg startsiden for katalogisering med fanen for vedlikehold av autoriteter
    Og at jeg skriver inn tilfeldig hendelse i feltet "Hendelser" og trykker enter
    Så får jeg ingen treff
    Så trykker jeg på "Opprett ny hendelse"-knappen
    Så skriver jeg inn samme tilfeldige hendelse i feltet "Alternativt navn" og trykker enter
    Så trykker jeg på "Opprett"-knappen
    Og jeg venter litt
    Så skriver jeg inn samme tilfeldige hendelse i feltet "Hendelser" og trykker enter
    Så velger jeg en hendelse fra treffliste fra hendelsesregisteret

  Scenario: Redigere sted i katalogisering
    Gitt at jeg vil opprette en sted
    Så åpner jeg startsiden for katalogisering med fanen for vedlikehold av autoriteter
    Og at jeg skriver inn tilfeldig sted i feltet "Steder" og trykker enter
    Så får jeg ingen treff
    Så trykker jeg på "Opprett nytt sted"-knappen
    Så skriver jeg inn samme tilfeldige sted i feltet "Alternativt navn" og trykker enter
    Så trykker jeg på "Opprett"-knappen
    Og jeg venter litt
    Så skriver jeg inn samme tilfeldige sted i feltet "Steder" og trykker enter
    Så velger jeg en sted fra treffliste fra stedsregisteret

  Scenario: Redigere verksserie i katalogisering
    Gitt at jeg vil opprette en verksserie
    Så åpner jeg startsiden for katalogisering med fanen for vedlikehold av autoriteter
    Og at jeg skriver inn tilfeldig verksserie i feltet "Verksserier" og trykker enter
    Så får jeg ingen treff
    Så trykker jeg på "Opprett ny verksserie"-knappen
    Så skriver jeg inn samme tilfeldige verksserie i feltet "Undertittel" og trykker enter
    Så trykker jeg på "Opprett"-knappen
    Og jeg venter litt
    Så skriver jeg inn samme tilfeldige verksserie i feltet "Verksserier" og trykker enter
    Så velger jeg en verksserie fra treffliste fra verksserieregisteret

  Scenario: Søke opp verk og velge riktig ut fra detaljer om forfatteren
    Gitt at det finnes et verk med forfatter
    Og at jeg legger navnet på verket inn på startsiden for arbeidsflyt og trykker enter
    Og jeg venter litt
    Så ser jeg at det står forfatter med navn og levetid i resultatlisten

  @wip
  Scenario: Søke opp verk hvor det finnes to med samme tittel men forskjellig forfatter
    Gitt jeg kan dikte opp en verkstittel
    Og at jeg er i personregistergrensesnittet
    Så leverer systemet en ny ID for den nye personen
    Og jeg kan legge inn navn fødselsår og dødsår for personen
    Og at jeg er i katalogiseringsgrensesnittet
    Og at systemet har returnert en ny ID for det nye verket
    Så jeg venter litt
    Og jeg legger til forfatter av det nye verket
    Og jeg kan legge til tittelen for det nye verket
    Og at jeg vil lage en person til
    Og at jeg er i personregistergrensesnittet
    Så leverer systemet en ny ID for den nye personen
    Og jeg kan legge inn navn fødselsår og dødsår for personen
    Og at jeg er i katalogiseringsgrensesnittet
    Og at systemet har returnert en ny ID for det nye verket
    Og jeg legger til forfatter av det nye verket
    Og jeg kan legge til tittelen for det nye verket
    Og at jeg legger navnet på verket inn på startsiden for arbeidsflyt og trykker enter
    Og jeg venter litt
    Så ser jeg at det er to treff i resultatlisten
    Og jeg venter litt
    Når jeg legger inn forfatternavnet på startsida
    Så velger jeg en person fra treffliste fra personregisteret
    Og at jeg legger navnet på verket og trykker enter
    Så ser jeg at det er ett treff i resultatlisten

  Scenario: Katalogisere verk som ikke er eget verk og som mangler hovedansvarlig
    Gitt jeg kan dikte opp en verkstittel
    Og at jeg legger navnet på verket inn på startsiden for arbeidsflyt og trykker enter
    Så får jeg ingen treff
    Så trykker jeg på "Opprett nytt verk"-knappen
    Så trykker jeg på "Opprett"-knappen
    Og jeg venter litt
    Så krysser jeg av i avkrysningboksen for "Verket har ikke hovedansvarlig"
    Og jeg venter litt
    Så krysser jeg av i avkrysningboksen for "Skal ikke vises som verk"
    Og bekrefter for å gå videre til "Beskriv utgivelse"
    Og jeg åpner verket i gammelt katalogiseringsgrensesnitt
    Så verifiserer jeg innskrevet verdi for "Verket har ikke hovedansvarlig", som i gammelt grensesnitt heter "Mangler hovedansvarlig"
    Så verifiserer jeg innskrevet verdi for "Skal ikke vises som verk", som i gammelt grensesnitt heter "Ikke eget verk"

  Scenario: katalogisere verk med relasjon til annet verk
    Gitt jeg kan dikte opp en verkstittel
    Og at jeg legger navnet på verket inn på startsiden for arbeidsflyt og trykker enter
    Så får jeg ingen treff
    Så trykker jeg på "Opprett nytt verk"-knappen
    Så trykker jeg på "Opprett"-knappen
    Og jeg venter litt
    Så krysser jeg av i avkrysningboksen for "Verket har ikke hovedansvarlig"
    Og jeg venter litt
    Og bekrefter for å gå videre til "Beskriv utgivelse"
    Og jeg venter litt
    Og bekrefter for å gå videre til "Beskriv verk"
    Og at jeg skriver inn tilfeldig verksnavn i feltet "Verk" og trykker enter
    Så får jeg ingen treff
    Så trykker jeg på "Opprett nytt verk"-knappen
    Så trykker jeg på "Opprett"-knappen
    Og jeg venter litt
    Og jeg velger verdien "Del av" for "Type relasjon"
    Og jeg venter litt
    Og jeg skriver verdien "1" for "Del"
    Og jeg trykker på "Legg til"-knappen
    Og jeg venter litt
    Så frisker jeg opp nettleseren
    Så sjekker jeg at den tilfeldige verdien jeg la inn for feltet "Verk" stemmer med verksnavnet

  Scenario: katalogisere verk med nasjonalitet
    Gitt jeg kan dikte opp en verkstittel
    Og at jeg legger navnet på verket inn på startsiden for arbeidsflyt og trykker enter
    Så får jeg ingen treff
    Så trykker jeg på "Opprett nytt verk"-knappen
    Så trykker jeg på "Opprett"-knappen
    Og jeg venter litt
    Så krysser jeg av i avkrysningboksen for "Verket har ikke hovedansvarlig"
    Og jeg venter litt
    Og bekrefter for å gå videre til "Beskriv utgivelse"
    Og jeg venter litt
    Og bekrefter for å gå videre til "Beskriv verk"
    Og jeg venter litt
    Og jeg velger verdien "Norge" for "Opprinnelsesland", som i gammelt grensesnitt heter "Nasjonalitet"
    Og jeg åpner verket i gammelt katalogiseringsgrensesnitt
    Så verifiserer jeg valgt verdi for "Nasjonalitet"

  Scenario: katalogisere verk som er del av en verksserie
    Gitt at jeg har en bok
    Og at det finnes et verk med forfatter
    Og jeg vil lage en ny verksserie
    Så leverer systemet en ny ID for den nye verksserien
    Og jeg kan legge inn verksseriens navn
    Når jeg legger inn forfatternavnet på startsida
    Og jeg venter litt
    Så sjekker jeg at trefflistens forfatterinnslag viser nasjonalitet og levetid
    Og velger verket fra lista tilkoplet forfatteren
    Og jeg venter litt
    Og bekrefter for å gå videre til "Beskriv utgivelse"
    Og jeg venter litt
    Og bekrefter for å gå videre til "Beskriv verk"
    Så skriver jeg inn "12" som verkets nummer i serien
    Så jeg venter litt
    Og at jeg skriver inn verksserie i feltet "Serie" og trykker enter
    Så velger jeg en serie fra treffliste fra serieregisteret
    Så jeg venter litt
    Og jeg trykker på "Legg til"-knappen
    Og jeg venter litt

