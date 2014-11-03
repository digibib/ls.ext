# encoding: UTF-8
# language: no

@wip
Egenskap: Liste over sirkulasjonsregler
  Som adminbruker
  For å vite at alle sirkulasjonsregler er registrerte
  Sjekker jeg mot en liste som gir oversikt over forventede sirkulasjonsregler

  Bakgrunn:
    Gitt at jeg er logget inn som adminbruker
    Og at jeg har følgende data
    | cat | item | fine      | finedays | 1st_remind | charge_period | max_loans | period | unit | hard_due_date | hard_due_date_compare | no_of_renewals  | renewal_period | no_of_reserves | branch | fines_cap  |
    | ALL | ALL  | 0.000000  | 0        | 7          | 14            | 20        | 28     | days |               | -1                    | 2               | 14             | 20             | ALL    |            |
    | ALL | A    | 0.000000  | 0        | 0          | 21            |           | 28     | days |               | -1                    | 3               | 28             | 20             | ALL    |            |
    | ALL | C    | 0.000000  | 0        | 0          | 21            |           | 28     | days |               | -1                    | 3               | 28             | 20             | ALL    |            |
    | ALL | DB   | DG        | 0.000000 | 0          | 0             | 21        | 14     | days |               | -1                    | 3               | 14             | 20             | ALL    |            |
    | ALL | DB   | DH        | 0.000000 | 0          | 0             | 21        | 28     | days |               | -1                    | 3               | 28             | 20             | ALL    |            |
    | ALL | DB   | DI        | 0.000000 | 0          | 0             | 21        | 28     | days |               | -1                    | 3               | 28             | 20             | ALL    |            |
    | ALL | DC   | DG        | 0.000000 | 0          | 0             | 21        | 14     | days |               | -1                    | 3               | 14             | 20             | ALL    |            |
    | ALL | DC   | DH        | 0.000000 | 0          | 0             | 21        | 28     | days |               | -1                    | 3               | 28             | 20             | ALL    |            |
    | ALL | DC   | DI        | 0.000000 | 0          | 0             | 21        | 28     | days |               | -1                    | 3               | 28             | 20             | ALL    |            |
    | ALL | ED   | 0.000000  | 0        | 0          | 21            |           | 7      | days |               | -1                    | 3               | 7              | 20             | ALL    |            |
    | ALL | ED   | DG        | 0.000000 | 0          | 0             | 21        | 14     | days |               | -1                    | 3               | 14             | 20             | ALL    |            |
    | ALL | ED   | DH        | 0.000000 | 0          | 0             | 21        | 28     | days |               | -1                    | 3               | 28             | 20             | ALL    |            |
    | ALL | ED   | TF        | 0.000000 | 0          | 0             | 21        | 28     | days |               | -1                    | 3               | 28             | 20             | ALL    |            |
    | ALL | EE   | 0.000000  | 0        | 0          | 21            |           | 7      | days |               | -1                    | 3               | 7              | 20             | ALL    |            |
    | ALL | EE   | DG        | 0.000000 | 0          | 0             | 21        | 14     | days |               | -1                    | 3               | 14             | 20             | ALL    |            |
    | ALL | EE   | DH        | 0.000000 | 0          | 0             | 21        | 28     | days |               | -1                    | 3               | 28             | 20             | ALL    |            |
    | ALL | EE   | DI        | 0.000000 | 0          | 0             | 21        | 28     | days |               | -1                    | 3               | 28             | 20             | ALL    |            |
    | ALL | EE   | TF        | 0.000000 | 0          | 0             | 21        | 28     | days |               | -1                    | 3               | 28             | 20             | ALL    |            |
    | ALL | EF   | 0.000000  | 0        | 0          | 21            |           | 7      | days |               | -1                    | 3               | 7              | 20             | ALL    |            |
    | ALL | GC   | 0.000000  | 0        | 0          | 21            |           | 28     | days |               | -1                    | 3               | 28             | 20             | ALL    |            |
    | ALL | GD   | 0.000000  | 0        | 0          | 21            |           | 28     | days |               | -1                    | 3               | 28             | 20             | ALL    |            |
    | ALL | GG   | 0.000000  | 0        | 0          | 21            |           | 28     | days |               | -1                    | 3               | 28             | 20             | ALL    |            |
    | ALL | J    | 0.000000  | 0        | 0          | 21            |           | 14     | days |               | -1                    | 2               | 14             | 0              | ALL    |            |
    | BKM | ALL  | 50.000000 | 0        | 14         | 14            |           | 60     | days |               | -1                    | 3               | 28             | 20             | ALL    | 100.000000 |
    | I   | ALL  | 0.000000  | 0        | 7          | 14            |           | 42     | days |               | -1                    | 2               | 28             | 20             | ALL    |            |
    | FJL | ALL  | 0.000000  | 0        | 7          | 14            |           | 42     | days |               | -1                    | 2               | 28             | 20             | ALL    |            |
    | B   | ALL  | 20.000000 | 0        | 7          | 14            | 20        | 28     | days |               | -1                    | 2               | 28             | 20             | ALL    | 20.000000  |
    | BHG | ALL  | 0.000000  | 0        | 0          | 14            |           | 42     | days |               | -1                    | 2               | 28             | 20             | ALL    |            |
    | L   | ALL  | 0.000000  | 0        | 0          | 14            |           | 42     | days |               | -1                    | 2               | 28             | 20             | ALL    |            |
    | MXV | ALL  | 50.000000 | 0        | 7          | 14            | 30        | 28     | days |               | -1                    | 2               | 28             | 20             | ALL    | 100.000000 |
    | MDL | ALL  | 50.000000 | 0        | 7          | 14            | 2         | 28     | days |               | -1                    | 2               | 28             | 20             | ALL    | 100.000000 |
    | PAS | ALL  | 0.000000  | 0        | 7          | 14            | 20        | 28     | days |               | -1                    | 2               | 28             | 20             | ALL    |            |
    | V   | ALL  | 50.000000 | 0        | 7          | 14            | 20        | 28     | days |               | -1                    | 2               | 28             | 20             | ALL    | 100.000000 |
    | SKO | ALL  | 0.000000  | 0        | 7          | 14            |           | 42     | days |               | -1                    | 2               | 28             | 20             | ALL    |            |
    | KL  | ALL  | 0.000000  | 0        | 7          | 28            |           | 60     | days |               | -1                    | 8               | 30             | 20             | ALL    |            |
    | ELE | ALL  | 0.000000  | 0        | 14         | 14            |           | 28     | days |               | -1                    | 3               | 10             | 20             | ALL    |            |
    | U   | ALL  | 50.000000 | 0        | 7          | 14            |           | 28     | days |               | -1                    | 2               | 28             | 20             | ALL    | 100.000000 |
    | UE  | ALL  | 0.000000  | 0        | 14         | 14            |           | 28     | days |               | -1                    | 2               | 10             | 20             | ALL    |            |
    | VGS | ALL  | 0.000000  | 0        | 0          | 14            |           | 42     | days |               | -1                    | 2               | 28             | 20             | ALL    |            |
  
  Scenario: Sjekke sirkulasjonsregler
    Når jeg er på administrasjonssiden for sirkulasjonsregler
    Og jeg velger å vise alle sirkulasjonsregler
    Så samsvarer listen i grensesnittet med listen over sirkulasjonsregler