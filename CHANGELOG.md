# Changelog

Library Extended (ls.ext) Release changelog.
Tags refer to built and pushed docker images.

To reproduce the state of the release, set GITREF to the chosen TAG in `docker-compose.env`.
To provision/configure, substitute the variables in `docker-compose-template-prod.yml` with e.g.
a secrets.env:

`source secrets.env && envsubst < docker-compose-template-prod.yml > docker-compose.yml`

The resulting compose file can then be used with `docker-compose up -d` to provision.

# Releases
## 0.3.0 (2016-11-09)

GITREF: 5eb52acd085ec5e88c19020a9c49ad44250bda68
KOHA:   90437fe3ee4e3d5af59182d7f3be477940b484f4

- patron-client:
  - add validator to firstname, add IE11 hack for firstname and lastname
  - Add proper headers for no caching to appropriate get requests
  - Use homebranch instead of holdingbranch
  - attempt at fixing closing filters when scrolling on mobile safari
  - Fix sorting on work page and related tests
  - Remove proptype from metaitem
  - Show titles in preferred languages in the search results
- catalinker:
  - manglende_opplysninger_på_autoriteter' into develop
  - fix showing and patching of authorities connected to other authorities DEICH-425
  - number of pages as multivalue. Main title single value.
  - copy nonEditable when set to first input of blank node input group DEICH-434
  - use correct subject type when extracting fields ti show from search result  DEICH-432
  - add pluralised form of dialog message DEICH-389
  - check for existing ISBN/EAN before fetching external data DEICH-389
  -force format ISBN numbers
- services:
  - add endpoint to find projections of resources by simple query
- koha:
  - add framework query param to biblio CRUD
  - Add bug 17561 reserveslip fix
  - add patch to use framework in batch mod items
  - Show 'Preg brikker' button next to RFID status button
  - sync homebranch, not holdingbranch
  - Add csv headers to runreports cronjob
  - Add maxdays to longoverdue cronjob
  - Add apacheconf overrides
  - stability fixes on patron search/edit
  - default search fields
  - Add codedLocationQualifier to labelgenerator response
  - show items.location in holds queue
  - upstream changes:
    https://github.com/Koha-Community/Koha/compare/239b81c1dd0cfa2e5e1f720ba9b8554536a9bc44...674d3875c81af122eb7f925845fe73cc4d817db4

## 0.2.0 (2016-11-02) First post-release!

GITREF: 4111a6e4981cb9f074310233cd7aee661dce6b56
KOHA:   b8d166a4c9463aace98c372c55f466a9aea8bcaf

- services:
  - add DEIC framework to records
  - json-ld framing
- patron-client:
  - mediatype filter
  - fiction/nonfiction filter
  - filter branches
  - available status fix
  - target audience fix
  - email login
  - styling
  - publishe rdata
  - item location
  - borrower name fix
  - publication publisher
  - reservation postition
  - reservation date
  - disable IE11 transitions
- catalinker:
  - numerous bugfixes
  - link to patron client work
  - compositiontype
  - follows/followedby/partof
  - work types
- koha:
  - account details mail
  - advance notices cronjob
  - SMS sender
  - send reports in cron

## 0.1.5 (2016-09-16) Bugfix release

TAG:  b31510201995ee07c5edb3fc7a0ff1cb1da8abce
KOHA: 8c3f4d426e6cbac8ef0b89d7be82e2e8e448fea6

- services:
  - better sync to Koha records
  patron-client:
  - validation of all input fields on registration
  - work page keep filter settings
  - styling and responsiveness
  - refactor work page and content
  - validation of translations
- koha:
  - fix hold slip
  - deichman marc framework
  - door access (meråpent) setup
  - print notice send to pidgeon printing service

## 0.1.4 (2016-09-16) Bugfix release

TAG:  81c564256c71a44b9db92e3c54ecd211e712624d
KOHA: 41274c52ef38821de6740a61baf3c68a1155855f

- koha:
  - fix included rfid javascript on checkin and checkout
- catalinker:
  - handle all media types and work types

## 0.1.3 (2016-09-15)

TAG:  4887b74abce1bc99f5d46f857c5038f1fb66dfa1
KOHA: f4185d1853c5969d4c71bfee2c583eb1bc658005

- koha:
  - patch SIP server to add pickup number to holds
  - add bug 14695: multi item reserve in admin
  - rfid-patch to print pickup slip when local hold found
  - messaging API: send email on registration
- patron-client:
  - Add info to publications on work page
  - style and interaction fixes for impaired
  - fixes for mobile view
  - mobile menu
  - work page layout
- services:
  - indexing optimatlizations
  - static base uri: data.deichman.no
  - many new mappings to marc in Koha
  - language and mediatype
- catalinker:
  - add part number to publication part
  - pattern check for ISBN and EAN search
- rfidhub:
  - stability patches

## 0.1.2 (2016-09-07)

TAG: 164c30a142dc13793fe469e82a817fa206abe70e

- koha:
  - added messaging route
  - RFIDhub patch for HOLD_SLIP
  - mask ssn number in Koha admin
- patron-client:
  - welcoming email to self registered user
- catalinker:
  - add mediatype audible
  - fix subjects from external resources
  - add Event entity
- services:
  - map literaryFrom fiction/nonfiction to MARC 008
  - map language iso codes to MARC 041
  - map corporation main entry to MARC 110
  - map workType to MARC 336
  - map mediaType to MARC 337
  - map format to MARC 338
  - map work/publication adaptations to MARC 385
  - map subject to MARC 650 (was: 690)
  - map literary form (that is not fiction/nonfiction) to MARC field 655
- fuseki
  - use official docker hub image

## 0.1.1 (2016-08-31)

TAG: 3482e74f4eba2b87830cb592c9b4af0cc6f16912

- koha:
  - update to LinkMobility SMS provider
  - Add Bug 16942 - Confirm hold results in ugly error to fix HOLD_SLIP
- patron-client:
  - work page sorting
  - self registration age limit 15 years

## 0.1.0 (2016-08-30)

TAG: 35179d801a7d786ccd5627bdf8b5a0d5a768393e

- koha:
  - Moreopen door access feature in Koha
  - age restriction
- services:
  - updated mappings for audience, format, literary form, contribution roles, and more

## 0.0.5 (2016-08-23)

TAG: c9a17446c1b215d3e09d653c21f2a503a64716ea

- patron-client:
  - Self registration categories for juvenile and adult
  - terms and conditions
- RFIDhub fixes

## 0.0.5 (2016-08-18)

TAG: 4a1c217b7a9479c1727d130534119093cd97568d

- patron-client:
  - standard messaging preferences

## 0.0.4 (2016-08-13)

TAG: 1b61cb97a157f6eac49c2734573da5f722150352

- migration:
  - set wants digest for all patrons
- services
  - add instrument, composition type, relation to other works, duration, dewey, musical key
- patron-client:
  - validation on self registration

## 0.0.3 (2016-08-10)

TAG: 13e5e22f08eb5c18c752e51f04ebbf293468b999

- patron-client:
  - render alt text for cover images
  - style adjustments

## 0.0.2 (2016-08-08)

TAG: 8151825267164b9bd17fe2d9d4179b6d78646f48

- Koha:
  - update for official Plack integration
  - supervisor daemon for better control of koha services
  - SIP2 patches for checkin a not checked out item

## 0.0.1 (1970-01-01)

- Everything else