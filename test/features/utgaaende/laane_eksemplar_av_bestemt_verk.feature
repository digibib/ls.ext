# encoding: UTF-8
# language: no

@wip @redef
Egenskap: Låne et eksemplar av et bestemt verk
  Som bruker av biblioteket
  Siden jeg skal ha norsk muntlig eksamen i morgen tidlig om Knut Hamsun
  Og jeg ikke har lest en eneste bok av han
  Og jeg står på hovedbiblioteket
  Ønsker jeg å låne et eksemplar av Sult NÅ

  @wip
  Scenario: Finn et ledig eksemplar på et bestemt språk
    Gitt at jeg befinner meg på "Hovedbiblioteket"
    Og gjør et søk på "Knut Hamsun Sult" på nettsiden
    Så vil jeg se at det er ledige eksemplarer av "Sult" på "norsk" som jeg kan låne
    Og jeg vil ikke se eksemplarer som ikke er på hylla på "Hovedbiblioteket"
    Og jeg vil ikke se eksemplarer av andre verk

  @wip
  Scenario: Jeg googler "Jane Eyre Deichmanske bibliotek"
    Gitt at jeg befinner meg på Googles nettsider
    Og gjør et søk på "Jane Eyre Deichmanske bibliotek"
    Og velger første treff i resultatlisten
    Så vil jeg se at det er ett eller flere ledige eksemplarer av "Jane Eyre"
