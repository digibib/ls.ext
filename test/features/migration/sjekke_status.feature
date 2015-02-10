# encoding: UTF-8
# language: no

@migration
Egenskap: Test av statuser
  Som adminbruker
  Ønsker jeg å sjekke at relevante statuser er tilgjengelige

  Bakgrunn:
    Gitt at jeg er logget inn som adminbruker

    Scenario: Test at de ulike statusene er tilgjengelige
	    Og at status DAMAGED er innstilt med data
	      | Authorized value | Description | Description (OPAC)| Icon | Branches limitations | Edit | Delete |
	      | 1                | skadet      |                   |      | No limitation        | Edit | Delete |
	    Og at status LOST er innstilt med data
	      | Authorized value | Description                     | Description (OPAC) | Icon | Branches limitations | Edit | Delete | 
	      | 7                | borte i transport               |                    |      | No limitation        | Edit | Delete | 
	      | 4                | ikke på plass                   |                    |      | No limitation        | Edit | Delete | 
	      | 6                | påstått ikke lånt               |                    |      | No limitation        | Edit | Delete | 
	      | 5                | påstått levert                  |                    |      | No limitation        | Edit | Delete | 
	      | 2                | regnes som tapt                 |                    |      | No limitation        | Edit | Delete | 
	      | 10               | retur eieravdeling (ved import) |                    |      | No limitation        | Edit | Delete | 
	      | 1                | tapt                            |                    |      | No limitation        | Edit | Delete | 
	      | 3                | tapt og erstattet               |                    |      | No limitation        | Edit | Delete | 
	      | 8                | tapt, regning betalt            |                    |      | No limitation        | Edit | Delete | 
	      | 11               | til henteavdeling (ved import)  |                    |      | No limitation        | Edit | Delete | 
	      | 9                | vidvanke, registrert forsvunnet |                    |      | No limitation        | Edit | Delete | 
	    Og at status WITHDRAWN er innstilt med data
	       | Authorized value | Description     | Description (OPAC) | Icon | Branches limitations | Edit | Delete | 
	       | 1                | trukket tilbake |                    |      | No limitation        | Edit | Delete | 
	    Og at status NOT_LOAN er innstilt med data
	      | Authorized value | Description        | Description (OPAC) | Icon | Branches limitations| Edit | Delete| 
	      | -1               | i bestilling       |                    |      | No limitation       | Edit | Delete| 
	      | 2                | ny                 |                    |      | No limitation       | Edit | Delete| 
	      | 7                | til innbinding     |                    |      | No limitation       | Edit | Delete| 
	      | 3                | til internt bruk   |                    |      | No limitation       | Edit | Delete| 
	      | 4                | til katalogisering |                    |      | No limitation       | Edit | Delete| 
	      | 6                | til retting        |                    |      | No limitation       | Edit | Delete| 
	      | 5                | vurderes kassert   |                    |      | No limitation       | Edit | Delete|
	    Og at status RESTRICTED er innstilt med data
	      | Authorized value | Description       | Description (OPAC) | Icon | Branches limitations | Edit | Delete |
	      | 1                | begrenset tilgang |                    |      | No limitation        | Edit | Delete |
	      | 2                | referanseverk     |                    |      | No limitation        | Edit | Delete |
