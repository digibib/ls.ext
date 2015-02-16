# encoding: UTF-8
# language: no

@ignore @issue-8 @bug-13411
Egenskap: Innlevering av ikke-utlånt materiale

  Notat: Disse scenariene tester ikke egentlig automaten, men at dersom vi oppfører oss
  som en automat så svarer Koha på en forutsigelig måte som passer for våre automater
  etter at vi har lastet dem med riktig oppsett. Test med automat er manuell.

  OBS! Denne henger på en sak i Koha så vi @ignore'er inntil videre.

  Bakgrunn:
    Gitt at det finnes en utlånsautomat
    Og at det finnes en låner med lånekort
      | firstname | dateenrolled | dateexpiry | dateofbirth | gonenoaddress | lost  | debarred | password | flags |
      | Knut      | 01/08/2015   | 10/08/2015 | 2010-01-01  | 0             | 0     |          | 1234     | 0     |
    Og at låneren har valgt "levere" på utlånsautomaten
    Og at låneren har materiale han ønsker å levere
    Og at materialet ikke er lånt ut til låner

  Scenario: Låner forsøker å levere materiale som ikke er lånt ut
    Og at materialet ikke er holdt av til en annen låner
    Når låneren legger materialet på automaten
    Så får låneren beskjed om at materialet ikke kan leveres

#----------------------------------------------------------
# TEST: CHECKIN MATERIAL ON HOLD SAME BRANCH - FAILED
# ---------------------------------------------------------

# >>>> 10.172.2.160  Checkin "09N20150209    13224620150209    132246APGansec location|AOHUTL|AB03010879976001|ACTAGLIB|\r"
# <<<< 10.172.2.160  Checkin_Response "100YNY20150209    132307AOHUTL|AB03010879976001|AQhutl|AJNorthern Italy|CS914.504 Bla/12th ed.|CThutl|CYN001965750|DATest Testesen (digitalutvikling\@gmail.com)|CV02|AFItem not checked out|\r"

# breakdown:
# status[2] = 0 : NOT OK, to be fixed in bug #13411
# status[3] = Y : resensitize
# status[4] = N : magnetic media
# status[5] = Y : alert

# CT = fsto : Destination loc hutl (could be because AO = HUTL)
# CV = 02   : hold for other branch, should be CV = 01 (hold for same branch) according to SIP3 spec

  Scenario: Låner forsøker å levere materiell som er reservert på egen avdeling
    Gitt at materialet har riktig antall RFID-brikker
    Og at det finnes en reservasjon på materialet
    Når innlevering blir valgt på automaten
    Og låneren legger materialet på automaten
    Så registrerer automaten at materialet er holdt på egen avdeling
    Og får låneren beskjed om at materialet ikke kan leveres
    Og det gis beskjed om at materialet skal legges i innleveringsboks

# ---------------------------------------------------------
# TEST: CHECKIN MATERIAL RESERVED TO DIFF BRANCH - FAILED
# ---------------------------------------------------------
# >>>> 10.172.2.160  Checkin "09N20150209    13303020150209    133030APGansec location|AOHUTL|AB03010530352001|ACTAGLIB|\r"
# <<<< 10.172.2.160  Checkin_Response "100YNY20150209    133050AOHUTL|AB03010530352001|AQhutl|AJOur mutual friend|CSta 82 Dic|CTfsto|CYN001965750|DATest Testesen (digitalutvikling\@gmail.com)|CV02|AFItem not checked out|\r"

# breakdown:
# status[2] = 0 : NOT OK, to be fixed in bug #13411
# status[3] = Y : resensitize
# status[4] = N : magnetic media
# status[5] = Y : alert

# CT = fsto : Destination loc fsto
# CV = 02   : hold for other branch

  Scenario: Låner forsøker å levere materiell som er reservert på annen avdeling
    Gitt at materialet har riktig antall RFID-brikker
    Og at det finnes en reservasjon på en annen avdeling
    Når innlevering blir valgt på automaten
    Og låneren legger materialet på automaten
    Så registrerer automaten at materialet er holdt på annen avdeling
    Og får låneren beskjed om at materialet ikke kan leveres
    Og det gis beskjed om at materialet skal legges i innleveringsboks

