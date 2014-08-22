# encoding: UTF-8
# language: no

Egenskap: Legge til avdeling
  Som adminbruker
  For å kunne registrere brukere
  Ønsker jeg å kunne legge til en avdeling

  Bibliotek har et navn og en kode i BaseBibliotek
  Se: http://www.nb.no/BaseBibliotekSearch/search.jsf og søk på 'Deichman'

  Bakgrunn:
    Gitt at jeg er logget inn som adminbruker

  @libraryCreated
  Scenario: Ny avdeling i biblioteksystemet
    Når jeg er på administrasjonssiden for avdelinger
    Og jeg legger inn "Hjørnebiblioteket" som ny avdeling med avdelingskode "DIGIBIB"
    Så finnes avdelingen i oversikten over avdelinger
