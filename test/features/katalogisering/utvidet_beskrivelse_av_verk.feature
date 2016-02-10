# encoding: UTF-8
# language: no

@redef
@check-for-errors
@no_phantomjs
Egenskap: Utvidet beskrivelse av verk
  Som katalogisator
  For å gi brukerne bedre gjenfinningsmuligheter
  Ønsker jeg å beskrive ver med opplysninger om litterær form, målgruppe, biografisk innhold og spesiell tilrettelegging

  @wip
  Scenario: Verk finnes - registrer emne for verket
    Gitt at det finnes et verk
    Og at det finnes et emne som heter "Hekser"
    Og jeg velger at emnet skal knyttes til utgivelsen som "Verk"
    Og jeg skriver "Hekser" i emnesøkefeltet
    Så vises en liste med emner hvor "Hekser" er med
    Så kan jeg velge det første emnet i listen
    Og jeg åpner verket i gammelt katalogiseringsgrensesnitt
    Så jeg verifiserer opplysningene om verket

  @wip
  Scenario: Verk finnes - registrer sjanger for verket
    Gitt at det finnes et verk
    Og at det finnes en sjanger som heter "Krim"
    Og at jeg skriver "Krim" inn i sjangersøkefeltet
    Så vises en liste med sjangre hvor "Krim" er med
    Så kan jeg velge den første sjangeren
    Og jeg åpner verket i gammelt katalogiseringsgrensesnitt
    Så jeg verifiserer opplysningene om verket

  Scenario: Verk finnes - registrer to verdier litterær form, målgruppe, biografisk innhold og spesiell tilrettelegging for verket
    Gitt at jeg har en bok
    Og at jeg har lagt til en person
    Når jeg legger inn forfatternavnet på startsida
    Så velger jeg forfatter fra treffliste fra personregisteret
    Og bekrefter for å gå videre til bekreft verk
    Og legger inn basisopplysningene om verket for hovedtittel og undertittel
    Og bekrefter for å gå videre til beskriv verket
    Og jeg skriver verdien "2015" for "Utgivelsesår"
    Og jeg velger verdiene "Bildebok" og "Pekebok" for "Litterær form"
    Og jeg velger verdien "Voksne" for "Målgruppe"
    Og jeg velger verdien "Selvbiografi" for "Biografisk innhold"
    Og jeg velger verdien "Lettlest, enkelt språk" for "Tilrettelegging"
    Og jeg åpner verket i gammelt katalogiseringsgrensesnitt
    Så verifiserer jeg innskrevet verdi for "Utgivelsesår"
    Så verifiserer jeg valgte verdier for "Litterær form"
    Så verifiserer jeg valgt verdi for "Målgruppe"
    Så verifiserer jeg valgt verdi for "Biografisk innhold"
    Så verifiserer jeg valgt verdi for "Tilrettelegging"