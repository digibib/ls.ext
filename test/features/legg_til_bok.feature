# encoding: UTF-8
# language: no

Egenskap: Legg til bok
  Som admin-bruker
  For å kunne låne ut bøker
  Ønsker jeg å kunne legge til en bok i systemet

  Bakgrunn:
    Gitt at jeg er logget inn som adminbruker

  @bookCreated @libraryCreated
  Scenario: Admin legger til ny bok
    Gitt at det finnes en materialtype for "Bok" med kode "L"
    Og at det finnes en avdeling
    Når jeg legger inn "Fargelegg byen!" som ny bok
    Så viser systemet at "Fargelegg byen!" er en bok som kan lånes ut
