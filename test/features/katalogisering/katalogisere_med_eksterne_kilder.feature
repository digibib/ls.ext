# encoding: UTF-8
# language: no

@redef @arbeidsflyt @check-for-errors @xvfb
Egenskap: katalogisere med eksterne kilder
  Som katalogisator
  Ønsker jeg å kunne hente data fra eksterne kilder for at katalogiseringen skal gå raskere og få høyest mulig kvalitet

  Scenario: Hente inn eksterne data
    Gitt at jeg har en bok
    Og jeg legger inn et ISBN-nummer på startsida og trykker tab
    Og jeg venter litt
    Så Sjekker jeg at det vises treff fra preferert ekstern kilde
    Og jeg trykker på "Bruk forslag"-knappen
    Så åpner jeg listen med eksterne forslag fra andre kilder for agent som skal knyttes til bidrag og velger det første forslaget
    Så får jeg ingen treff
    Og jeg trykker på "Opprett ny person"-knappen
    Så legger jeg inn fødselsår og dødsår og velger "Norge" som nasjonalitet
    Og jeg trykker på "Opprett"-knappen
    Så åpner jeg listen med eksterne forslag fra andre kilder for rolle som skal knyttes til bidrag og velger det første forslaget
    Så setter jeg markøren i søkefelt for verk og trykker enter
    Så får jeg ingen treff
    Og jeg trykker på "Opprett nytt verk"-knappen
    Og jeg trykker på "Opprett"-knappen
    Og jeg trykker på "Legg til"-knappen
    Og jeg venter litt
    Så sjekker jeg at det finnes en hovedinnførsel hvor personen jeg valgte har rollen "Dirigent" knyttet til "verket"
    Og så trykker jeg på "Neste steg: Beskrivelse"-knappen
    Så sjekker jeg at verdien for "Utgivelsesår" er "1998"
    Så åpner jeg listen med eksterne forslag fra andre kilder for utgivelsesår som skal knyttes til utgivelsen og velger det første forslaget
    Så sjekker jeg at verdien for "Utgivelsesår" nå er "2000"
    Så debugger jeg
