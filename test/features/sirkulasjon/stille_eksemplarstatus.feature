# encoding: UTF-8
# language: no

@wip
Egenskap: Stille eksemplarstatus
  Som adminbruker
  Ønsker jeg å stille status til et eksemplar

  Merk: Denne testen bør splittes opp til å sjekke på de ulike status-typene:
  - "Withdrawn status"
  - "Damaged status"
  - "Use restrictions"
  - "Not for loan"
  - ...

  Bakgrunn:
    Gitt at jeg er logget inn som adminbruker

    @ignore
    Abstrakt Scenario: Stille eksemplarstatus
      Gitt at boka finnes i biblioteket
      Når jeg leter opp boka i katalogiseringssøk
      Og velger å redigere eksemplaret
      Og jeg stiller status til "<Status>"
      Så viser systemet at eksemplaret har status "<Status>"

      Eksempler:
        | Status                          |
        | trukket tilbake                 |
        | borte i transport               |
        | ikke på plass                   |
        | påstått ikke lånt               |
        | påstått levert                  |
        | regnes som tapt                 |
        | retur eieravdeling (ved import) |
        | tapt                            |
        | tapt og erstattet               |
        | tapt, regning betalt            |
        | til henteavdeling (ved import)  |
        | vidvanke, registrert forsvunnet |
        | skadet                          |
        | begrenset tilgang               |
        | referanseverk                   |
        | i bestilling                    |
        | ny                              |
        | til innbinding                  |
        | til internt bruk                |
        | til katalogisering              |
        | til retting                     |
        | vurderes kassert                |
