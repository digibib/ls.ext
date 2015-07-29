# encoding: UTF-8
# language: no

@redef
Egenskap: Vise koblinger fra verk til andre ressurser i systemet
  Som katalogisator
  For se hvordan et verk er knyttet til andre ressurser i systemet
  Ønsker jeg å se og følge lenker fra verk som leder til disse ressursene

  Scenario: Katalogisator følger lenke til verks-siden
   Gitt at jeg ser på et lagret verk
   Når jeg klikker på lenken til verks-siden
   Så kommer jeg til verks-siden for det aktuelle verket

  @wip @biblioMove
  Scenario: Katalogisator følger lenke til utgave av verket registrert i Koha
   Gitt at jeg ser på et lagret verk med biblio-koblinger
   Når jeg klikker på lenken til en biblio-kobling
   Så kommer jeg til Koha's presentasjon av biblio