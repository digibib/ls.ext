# encoding: UTF-8
# language: no

@wip @issue-5
Egenskap: Mine sider
  Som en låner
  For å kunne hente ut informasjon om mitt låneforhold (uten å bruke Internett ...)
  Ønsker jeg "mine sider"-funksjonalitet tilgjengelig på utlånsautomat

  Scenario: Til avhenting - se liste og skrive ut

  Scenario: Reserveringer - se og slette

  Scenario: Reserveringer - se og skrive ut liste

  Scenario: Lån - se liste, forlenge lån og skrive ut liste

  Scenario: Lån - se liste med ikke forlengbart lån og sende epost

  Scenario: Skrive ut alt lånt materiale, til avhenting og reservert

  Scenario: Sende epost med alt lånt materiale, til avhenting og reservert



#  ---------------------------------------------------------
#  TEST 4: MIN SIDE: MINE LÅN - FAILED
#  ---------------------------------------------------------
#
#  >>>> 10.172.2.160  Patron_Information "6304720150209    131829  Y       AOHUTL|AAN001965750|ACTAGLIB|AD9999|BP0000|BQ9999|\r"
#  <<<< 10.172.2.160  Patron_Information_Response "64              04720150209    131849000100000001000000000002AOHUTL|AAN001965750|AETest Testesen|BLY|CQY|CC5|AU03011078043002|BDTestveien 2 OSLO 0179|BEdigitalutvikling\@gmail.com|PB19810809|PCV|PIY|AFGreetings from Koha. |\r"
#
#  breakdown request:
#  status[2..4] = 047 : language
#  status[25]   = Y   : charged items details
#
#  breakdown response:
#  status[16..18] = 047  : language
#  status[37..40] = 0001 : hold items count
#  status[41..44] = 0000 : overdue items count
#  status[45..48] = 0001 : charged items count
#  status[49..52] = 0000 : fine items count
#  status[53..56] = 0000 : recall items count
#  status[57..60] = 0002 : unavailable items count
#
#  CC = 5 : fee limit
#  AU = [03011078043002] : list of charged items
#  PC = V : ???
#
#  # Item information
#  >>>> 10.172.2.160  Item_Information "1720150209    131829AOHUTL|AB03011078043002|ACTAGLIB|\r"
#  <<<< 10.172.2.160  Item_Information_Response "1804020120150209    131849AB03011078043002|AJThe Pillars of the earth|AQhutl|BGhutl|AH20150226    235900|\r"
#
#  breakdown response:
#  status[2..3] = 04 : circulation status
#  status[4..5] = 02 : security marker
#  status[6..7] = 01 : fee type
#  AQ = hutl : permanent location
#  BG = hutl : owner institution
#
#  >>>> 10.172.2.160  Item_Information "1720150209    132033AOHUTL|AB03010530352001|ACTAGLIB|\r"
#  <<<< 10.172.2.160  Item_Information_Response "1804020120150209    132053AB03011472735001|AJTuren g\xC3\xA5r til Nord-Italia|AQhutl|BGhutl|CF1|AH20141031    235900|\r"
#
#  breakdown response:
#  status[2..3] = 04 : circulation status
#  status[4..5] = 02 : security marker
#  status[6..7] = 01 : fee type
#  AQ = hutl : permanent location
#  BG = hutl : owner institution
#  CF = 1    : hold queue length