# encoding: UTF-8
# language: no

@redef @arbeidsflyt @check-for-errors @xvfb
Egenskap: katalogisere med eksterne kilder
  Som katalogisator
  Ønsker jeg å kunne hente data fra eksterne kilder for at katalogiseringen skal gå raskere og få høyest mulig kvalitet

  Scenario: Hente inn eksterne data
    Gitt at jeg har en bok
    Og jeg legger inn et ISBN-nummer på startsida og trykker enter
    Og jeg venter litt
    Så Sjekker jeg at det vises treff fra preferert ekstern kilde
    Så trykker jeg på "Bruk forslag"-knappen
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
    Så trykker jeg på "Neste steg: Beskrivelse"-knappen
    Så sjekker jeg at verdien for "Utgivelsesår" er "1998"
    Så åpner jeg listen med eksterne forslag fra andre kilder for utgivelsesår som skal knyttes til utgivelsen og velger det første forslaget
    Og jeg venter litt
    Så sjekker jeg at verdien for "Utgivelsesår" nå er "2000"
    Så sjekker jeg at verdien for "Sidetall" er "207 s."
    Så åpner jeg listen med eksterne forslag fra andre kilder for sidetall som skal knyttes til utgivelsen og velger det første forslaget
    Så sjekker jeg at verdien for "Sidetall" nå er "208"
    Så åpner jeg listen med eksterne forslag fra andre kilder for language som skal knyttes til utgivelsen og velger det første forslaget
    Så sjekker jeg at "Norsk (bokmål)" er blant verdiene som er valgt for Språk
    Så trykker jeg på "Neste steg: Verksopplysninger"-knappen
    Så trykker jeg på "Neste steg: Beskriv verket"-knappen
    Så trykker jeg på "Neste steg: Biinnførsler"-knappen
    Så trykker jeg på den første trekanten for å søke opp personen i forslaget
    Og jeg trykker på "Opprett ny person"-knappen
    Så noterer jeg ned navnet på personen
    Og jeg trykker på "Opprett"-knappen
    Og jeg trykker på "Legg til"-knappen
    Så sjekker jeg at det finnes en biinnførsel hvor personen jeg valgte har rollen "Forfatter" knyttet til "utgivelsen"
    Så trykker jeg på den første trekanten for å søke opp personen i forslaget
    Og jeg trykker på "Opprett ny person"-knappen
    Så noterer jeg ned navnet på personen
    Og jeg trykker på "Opprett"-knappen
    Og jeg trykker på "Legg til"-knappen
    Så sjekker jeg at det finnes en biinnførsel hvor personen jeg valgte har rollen "Oversetter" knyttet til "utgivelsen"
    Og jeg trykker på "Bruk forslag"-knappen
    Så trykker jeg på den første trekanten for å søke opp personen i forslaget
    Og jeg trykker på "Opprett ny person"-knappen
    Så noterer jeg ned navnet på personen
    Og jeg trykker på "Opprett"-knappen
    Og jeg trykker på "Legg til"-knappen
    Så sjekker jeg at det finnes en biinnførsel hvor personen jeg valgte har rollen "Komponist" knyttet til "utgivelsen"

    
