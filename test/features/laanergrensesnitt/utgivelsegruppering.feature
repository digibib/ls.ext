# encoding: UTF-8
# language: no

@redef @wip
Egenskap: Gruppering på utgivelse
  Som bruker av bibliotekets nettsider
  For å kunne finne eksemplar i rett format og språk
  Ønsker jeg å kunne se eksemplarer gruppert etter utgivelse (m/informasjon om format og språk)

  Scenario: En utgivelse
    Gitt et verk med en utgivelse
    Når jeg er på sida til verket
    Så ser jeg format og språk for utgivelsen

  Scenario: Flere utgivelser og flere eksemplarer
    Gitt et verk med flere utgivelser og eksemplarer
    Når jeg er på sida til verket
    Så har eksemplarene en identifikator (strekkode)
    Og eksemplarene er gruppert etter utgave m/informasjon om format og språk
