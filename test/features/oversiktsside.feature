# encoding: UTF-8
# language: no

@wip
Egenskap: Oversiktsside
  Som bruker / tester / drifter av biblioteksystemet
  Siden jeg er ønsker å bruke mindre tid på å lete etter lenker
  Ønsker jeg finne en oversikt over lenker til ulike deler av biblioteksystemet

  @wip
  Scenario: Oversiktsside med en lenke
    Gitt at jeg er på oversiktssiden
    Så skal jeg finne lenker til:
      | text          |
      | OPAC          |
      | Intra         |
      | Catalinker    |
      | PatronClient  |
      | Services      |
      | Triplestore   |
      | Elasticsearch |
