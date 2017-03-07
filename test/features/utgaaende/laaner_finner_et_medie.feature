# encoding: UTF-8
# language: no

@wip @redef
Egenskap: Låner finner et medie
  Som en låner
  For at jeg skal kunne finne et medium jeg bil bruke
  Vil jeg kunne søke etter medier
  Og få relevante treff

  @wip
  Scenario: Finn et medie som inneholder ord med én bokstav
    Gitt at jeg befinner meg på søkesiden
    Og jeg skriver inn én bokstav
    Og jeg klikker søk
    Så får jeg treff som inneholder ord med denne bokstaven alene
