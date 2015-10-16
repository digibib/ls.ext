# encoding: UTF-8
# language: no

@redef
Egenskap: Redigere autoritative persondata
  Som Katalogisator
  For å vedlikeholde det autorative personregisteret
  Ønsker jeg å kunne registrere en personressurs med navn, fødselsår og eventuelt dødsår

  Bakgrunn:
    Gitt at jeg er i personregistergrensesnittet

  Scenario: Katalogisator legger til en ny person
    Når jeg vil legge til en person
    Så leverer systemet en ny ID for den nye personen
    Og jeg kan legge inn navn fødselsår og dødsår for personen
    Og grensesnittet viser at personen er lagret
    Når jeg klikker på linken ved urien kommer jeg til personsiden
    Så kommer jeg til personsiden
