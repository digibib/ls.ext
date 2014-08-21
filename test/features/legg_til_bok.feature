# encoding: UTF-8
# language: no

Egenskap: Legg til bok
  Som admin-bruker
  For å kunne låne ut bøker
  Ønsker jeg å kunne legg til en bok i systemet

  @bookCreated @libraryCreated
  Scenario: Admin legger til ny bok
    Gitt at jeg har rettigheter til å katalogisere
    Og at det finnes en materialtype for "Bok" med kode "L"
    Og at det finnes en avdeling
    Når jeg legger inn "Fargelegg byen!" som ny bok
    Så viser systemet at "Fargelegg byen!" er en bok som kan lånes ut
