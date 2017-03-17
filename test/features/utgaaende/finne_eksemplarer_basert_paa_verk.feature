# encoding: UTF-8
# language: no

@wip @redef
Egenskap: Finne eksemplarer basert på opplysninger om verk
  Som bruker av biblioteket
  Siden jeg er interessert i en bestemt periode
  Ønsker jeg finne en oversikt over verk fra denne perioden

  Bakgrunn:
    Gitt at jeg befinner meg på søkesiden for brukere
    Og at det finnes flere verk som er utgitt første gang i perioden "1918-1939"

  @wip
  Scenario: Finn eksemplarer av verk fra en gitt periode
    Når jeg søker på verk fra perioden "1918-1939"
    Så vil jeg finne alle ledige eksemplarer av verket

  @wip
  Scenario: Finn ledige eksemplarer av verk på gitt avdeling 
    Gitt at jeg befinner meg på "Holmlia" avdeling
    Når jeg søker på verk fra perioden "1918-1939"
    Så vil jeg bare finne verk som har ledige eksemplarer på "Holmlia"

  @wip
  Scenario: Finn ledige eksemplarer av verk på annen avdeling 
    Gitt at jeg befinner meg på "Holmlia" avdeling
    Når jeg søker på verk fra perioden "1918-1939"
    Og det ikke finnes ledige eksemplarer på "Holmlia"
    Så vil jeg finne verk som har ledige eksemplarer på andre avdelinger