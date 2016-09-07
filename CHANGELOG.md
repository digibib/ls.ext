# Changelog

Library Extended (ls.ext) Release changelog.
Tags refer to built and pushed docker images.

To reproduce the state of the release, set GITREF to the chosen TAG in `docker-compose.env`.
To provision/configure, substitute the variables in `docker-compose-template-prod.yml` with e.g.
a secrets.env:

`source secrets.env && envsubst < docker-compose-template-prod.yml > docker-compose.yml`

The resulting compose file can then be used with `docker-compose up -d` to provision.

# Releases

## 0.1.2 (2016-09-07)

TAG: f2231a651aa6d80fff29d7bc452bc3d4bcd080a2

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