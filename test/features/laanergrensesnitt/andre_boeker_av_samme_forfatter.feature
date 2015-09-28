# encoding: UTF-8
# language: no

@wip @redef
Egenskap: Bruker finner andre bøker av samme forfatter
  Som bruker av biblioteket
  Siden jeg ble inspirert av en bok
  Ønsker jeg å låne en annen bok av samme forfatter

  Bakgrunn:
    Gitt at jeg har lånt "Harry Potter og de vises stein" av "J.K. Rowling"

  @wip
  Scenario: Finn bok av samme forfatter
    Når jeg leverer boken
    Og gjør et søk på andre bøker av forfatteren på nettsiden
    Så vil jeg finne en annen bok enn "Harry Potter og de vises stein"

  @wip
  Scenario: Finn ledig bok
    Gitt at jeg har levert boken
    Og gjør et søk på andre bøker av forfatteren på nettsiden
    Så vil jeg finne bare ledige eksemplarer

  @wip
  Scenario: Finn neste bok i serien
    Når jeg leverer boken på Holmlia avdeling
    Og vil låne neste bok i serien
    Så vil jeg kunne se om det finnes et ledig eksemplar på Holmlia
