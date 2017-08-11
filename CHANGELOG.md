# Changelog

Library Extended (ls.ext) Release changelog.
Tags refer to built and pushed docker images.

To reproduce the state of the release, set GITREF to the chosen TAG in `docker-compose.env`.
Add configuration overrides to variables in `.env`:

Then setup environment with docker compose, sourcing the GITREF and KOHA_IMAGE_TAG:

`source docker-compose.env && docker-compose -f common.env -f prod.env up -d`

# Releases

## 2017.48

KOHA: 8e3b1c1814aaa079f33d4ed54fc22d30f5478c61
GITREF: TODO

- Koha
  - DEICH-855: Reintroduce expirationdate on HOLD_SLIP
  - DEICH-852: Add Template Plugin for extending waiting period
  - DEICH-844, DEICH-828: Simplify acceptance of self-registered users in Koha
  - DEICH-861: SIP checkout of material on hold should not be allowed
  - DEICH-656: Add rudimentary NCIP and ILL support
  - DEICH-860: Fix duplicates in biblios expanded endpoint
- Catalinker:
  - DEICH-688, DEICH-569: work series also show up on work page when related
  - DEICH-736: fix multiple nationality on edit person popup form
  - DEICH-614: Fix/conform main title information fields in catalinker
  - DEICH-835: dont allow saving on incomplete fields in advanced edit
  - DEICH-837: hide infrequently used fields
  - DEICH-868: fix parsing of numbers
- Annet
  - DEICH-393: Rewrite index to use parent/child mapping
  - Koha-indexer: DEICH-848 - fix availability filter

## 2017.47

KOHA: de59526ee8b3c6adc9a709d40d69abc9767f8dfe
GITREF: 3091db77df0d7cc9ef51c45bf2a4af3ebb85763e

- Koha
  - Upgraded koha to 17.05.01 (bugfix release)
  - SIP2: allow checkouts when not checked in
  - [18651] fix: Move of checkouts is still not correctly handled
  - [18835] fix: SQL syntax error in overdue_notices.pl
- Patron-client
  - DEICH-847 Fix search hits when page number active
  - DEICH-851 Search hits UI improvements
- Annet
  - DEICH-730 Delete publications with no items attached
  - DEICH-841 tool to run periodic jobs on containers

## 2017.46

KOHA: 58b4c284ff53e3b4507f37e52668a8a09e46aa9a
GITREF: 47d79983fe7b153b198c8abf2ea383440d911c02

- Koha
  - DEICH-826 Oppgradere koha til 17.05
  - DEICH-834 rydde bort automatavdelinger i Koha
- Patron-client
  - DEICH-825 Viser nulltreffsinfo i det søket lastes
  - DEICH-818 Tilgjengelighetsfilter tar ikke hensyn til statuser
  - DEICH-536 Søk på termer med skråstrek feiler
  - DEICH-793 Forklarende tilføyelse på bidragsyter ikke synlig og søkbar
- Catalinker
  - DEICH-712 Feil treffliste for sted
  - DEICH-640 Feil ved oppslag med forslag som inneholder parentes
  - DEICH-711 Tastaturnavigering. Tab hopper over felt
  - DEICH-836 Oppslag i registre - Visning. Manglende opplysninger
- Annet
  - DEICH-830 Innhente "krydder" fra eksterne kilder Bokbasen

## 2017.45

KOHA: 40aecbcf9e419f8feb8fc8071b648ebf957af7bb
GITREF: 3dfb19f4ba8cfb9b87d817f3b2f903842e522217

- Koha:
  - DEICH-795: Plugin for closing branches and handling item and reservations
  - DEICH-794, DEICH-822: Closing Stovner
  - DEICH-791: shelf cleaner report
  - DEICH-824: Plugin for School Overdue Reports
  - DEICH-822: Update timestamp when checking in book with SIP
  - DEICH-823: Add Cronjob for updating item ccodes
  - DEICH-758: Activate update of borrower last seen
- Patron-client:
  - DEICH-804: Verk som emne mangler opplysninger
  - DEICH-805: Klikk på verk som emne gir feil søk
  - DEICH-820: Vis aldersgrense
- Catalinker:
  - DEICH-707: Oppslag i autoritetsregister bommer
  - DEICH-706: Oppslag i registre - Sortering
  - DEICH-705: Oppslag i registre - Visning
  - DEICH-709: Oppslag i registre - Oppslag i alle opplysninger
  - DEICH-468: Sortering av korporasjonsregister må ta hensyn til underavdeling (2d)
- Annet
  - DEICH-797 - Bedre logging av mysql

## 2017.44

KOHA: 722ef07b638ca04731b20f934c09578d1c72219b (uforandret)
GITREF: 32fc3ddb662223798274c80e341f7ce223dd6af9

- was never released

## 2017.43

KOHA: 722ef07b638ca04731b20f934c09578d1c72219b
GITREF: 9e0d45352ebc09febf2e20185f69b4db30ccab49

- Koha
  - DEICH-767 Fiks på kvittering på skole
  - DEICH-816 Skjul eksemplarer med status forlengst forfalt
  - DEICH-768 Automater: bare første hentenummer vises hvis flere eks samme tittel
  - DEICH-814 Koha API for lånerhistorikk
- Patron-client:
  - DEICH-802 Filter ikke lukket på mobil.
  - DEICH-811 Listevisning av trefflisten
- Catalinker:
  - DEICH-710 Oppslag i registre - Vise tilknyttede ressurser
  - DEICH-799 Bytte rekkefølge på felt for delnummer og deltittel ved oppretting av nytt verk
  - DEICH-739 Oppslag etterverk med utropstegn i tittel feiler
  - DEICH-815 Kobling av verk feiler

## 2017.42

KOHA: 8e004ac2a27725b3a79305afb4700721a5e00cf8
GITREF: ad860515c5ba68c8d5c490840291263e7d380bbe

- Koha
  - DEICH-785: read-only mysql replisering
  - DEICH-794, DEICH-795: Nytt plugin for stenging av filialer
  - DEICH-796: Rewrite biblio expanded endpoint to use hand-crafted SQL
  - DEICH-791: Rapport til Wanda hyllerydder
- Patron-client:
  - DEICH-445: Antatt ventetid på mine sider
  - DEICH-755: Sortering av lån feil visning i nettlesere
  - DECIH-794: skjul avdelinger med merknader i API (branchnotes)
  - nye ikoner
- Catalinker:
  - DECIH-609: oppslag på ugyldige ean hos bs

## 2017.41

KOHA: deaa4b9b8bf17e719c31c516e12f08d30d038907
GITREF: d8c49052fa9e79aa02d8d4aaa1b22ae5e5e9ec9e

- Koha
  - add Koha template plugin for kemnersaker
  - activate update_issues cronjob for popularity stats
  - DEICH-771: Vis bøker som er knyttet til kemnersak
- Patron-client:
  - DEICH-755: Sortering av lån etter dato
  - DEICH-788: Beholde filtre ved nytt søk
  - DEICH-729: Vis status i ekesmplartabell dersom det ikke finnes eksemplarer
- Catalinker:
  - DEICH-576: Hindre tomme blanke noder
  - DEICH-614: Mangelfull visning av tittelopplysninger

## 2017.40

KOHA: aa0a81d20eaff4dd143f310ad4fb7a9f1c216bf5
GITREF: 25bf63b5a2b3590abab4a57dd9e871f085e642c7

- Koha
  - Update koha build to 16.11.07:
    local - rework SIP2 automat transfer
    Bug 18429 - Receiving an item should update the datelastseen
    Bug 18335 - Check in: Make patron info in hold messages obey syspref AddressFormat
    Bug 12021 - SIP2 checkin should alert on transfer and use CT for return branch
    Bug 18439 - Resend button for notices being hidden by CSS and never unhidden
    Bug 18001 - LocalHoldsPriority can cause multiple holds queue lines for same hold request
    Bug 18372 - transits are not created at check in despite user responsing Yes to the prompt
    Bug 17821 - due date in intranet search results should use TT date plugin
    Bug 17309 - Renewing and HomeOrHoldingBranch syspref
    Bug 18329 - Batch record deletion broken
    Bug 18266: Fix internal error when paying fine for lost item without.. item
    Bug 18242: 16.11.x adaptation - Old::Checkouts vs OldIssues
    Bug 17346: Make checkin column hidable
    Bug 12972 - Transfer slip and transfer message (blue box) can conflict
    Bug 17758 - SIP checkin does not handle holds correctly
    Bug 17995 - HOLDPLACED notice should have access to the reserves table
    Bug 18058: Allow borrower_message_preferences to be truncated
  - DEICH-769: Branchtransfers har blitt liggende i transfer fra automat til avd
- Services:
  - DEICH-782: Identifisere DFB-poster
- Patron-client:
  - DEICH-755: Sortering av lån etter dato
  - DEICH-786: Fjern bestill-knapp på periodika
- Catalinker:
  - DEICH-789: Bytt rekkefølge på partNumber og partTitle
  - DEICH-578: Åpne redigering av autoriteter i treffliste

## 2017.39

KOHA: 3e191782ac52e7041730d54b786ccce4c4123c04
GITREF: 08227eaaaaeefb433aaee909afd8a379b9a4f555

- Koha
  - DEICH-112: Lagt til ekstra felt i REST biblio for tilgjengelighet
  - DEICH-777: Lagt til Koha plugin for purring av klasselånere
- Services:
  - DEICH-685: Splitte verk del III
- Patron-client:
  - DEICH-772: Hele tittelen på mine sider
  - DEICH-781: Fiks på 'hvor finnes denne'
  - DEICH-784: Justering av relevans
  - DEICH-445: Antatt ventetid på mine sider
- Catalinker:
  - DEICH-721: Hente flere opplysninger fra Biblioteksentralen
  - DEICH-763: Verkstype mangler i skjema
  - DEICH-511: Nytt felt på utgivelse - alternativ tittel
- Annet:
  - DEICH-112: koha_indexer - komponent som henter sirkulasjonsdata fra Koha for indeksering

## 2017.38

KOHA: b5bf35b150b04ec084ea8f61a0888ac3dbecccfc
GITREF: df6ba57130a9149e4a2a01cb587739ffce50ade7

- Koha:
  - DEICH-778: opgradert fra 16.11.04 til 16.06.11
- Catalinker:
  - DEICH-773: engelsk versjon av catalinker
- Patron-client:
  - DEICH-754: Sjekk mot og utfylling av sms/e-post ved endringen av inntsillinger på min side
  - DEICH-779: Safari - resultatlisten faller under filtre
  - DEICH-766: bufikser/forbedringer for "Hvor finnes denne?"

## 2017.37

KOHA: 240ac269571360b3d61e50be80c9f58a9cdd35ee (uforandret)
GITREF: d43935f65baf513ba9f2115b54cc54c05312e42e

- Services:
  - DEICH-752: write all title parts to MARC 245a
- Catalinker:
  - DEICH-752: refuse to delete work with incoming relations
  - DEICH-762: make catalinker wider, adjust width of additonal entries frame
  - DEICH-765: remove unwanted worktype label
  - DEICH-503: old stale contributions when changing work
  - DEICH-644: refuse to delete work with incoming relations
  - DEICH-719: when deleting resources also remove triples referring to deleted resource
- Patron-client:
  - DEICH-741: Handle multiple work series
  - DEICH-756: url to self register
  - DEICH-750: boost score of certain languages


## 2017.36

KOHA: 240ac269571360b3d61e50be80c9f58a9cdd35ee (uforandret)
GITREF: efe3f9b7d6dfd9cf54933c0fef6e3f43887cb76e

- Services:
  - DEICH-667: Sirkulasjon i services
- Catalinker:
  - DEICH-100: Koble duplikate verk
- Patron-client:
  - DEICH-713: Feil medietype på mine sider
  - DEICH-669: Lenker på mine sider
  - DEICH-654: Styling + Filter på filial + medietype visning på resultatliste
  - DEICH-749: Relevans: nyeste utgivelser først
- Annet
  - DEICH-748: Relevans: testområde

## 2017.35

KOHA: 240ac269571360b3d61e50be80c9f58a9cdd35ee
GITREF: cc01beb6b3420576083d74d642d5a111c1a313d1

- Catalinker:
  - DEICH-740: Manglende opplysninger fra ekstern kilde II
  - DEICH-535: Manglende varsel om duplikat katalogisering
  - DEICH-564: Sjekk på ISBN må kontrollere både ISBN-10 og ISBN-13
  - DEICH-743: Hindre doble og blanke opplysninger etter splitting av verk
- Koha:
  - add behindExpiditedUser to biblio expanded
  - biblio expanded: treat damaged items as anavailable (DEICH-715)
- Patron-client:
  - DEICH-731: Fritekstsøk på isbn uten skilletegn feiler
  - DEICH-737: Klikk på emne fra verksside gir feil søk
  - DEICH-715: Feil status i søket
  - DEICH-734: Vise bare den hovedansvarliges navn bak «Av:» på verksside
  - DEICH-585: Søk prøver å vise deler på utgivelser som ikke har deler
  - DEICH-717: Fjern hermetegn
  - DEICH-733: Søk på samme term med og uten stor forbokstav gir ulike trefflister
  - DEICH-728: Ikke sett på vent når status er "På vei"

## 0.9.0. (2017-03-21)

KOHA: 7933c6de69c171ef9bb394e19c8202a3d5978ec1
GITREF: 477de94d031f67a74c4d072f4335db0253c50aca

- Catalinker:
  - DEICH-659: Forenkling av registereing av deler
  - DEICH-720: Utvidet redigering av autoriteter tar ikke utgangspunkt i valgt autoritet
  - DEICH-572: Knappen "Beskriv utgivelse" oppretter ny utgivelse, også ved redigering av eksisterende
  - DEICH-727: Manglende opplysninger fra ekstern kilde
  - DEICH-722: Verkstype på nytt verk legger seg også på relatert verk
- Koha:
  - DEICH-735: Koha API info om res på vei

## 0.8.99 (2017-03-15)

KOHA: 7933c6de69c171ef9bb394e19c8202a3d5978ec1
GITREF: ?

- Patron-client:
  - Div fikser og forbedringer i sett hold på vent
  - DEICH-724 Sjanger vises ikke på verkssiden
  - fiks flere til avhenting på samme biblionummer
- Catalinker:
  - DEICH-602 Uforståelig treffliste for verk og utgivelser
- Koha:
  - Fiks automatic branchtransfer til å inkludere reservasjoner satt på vent

## 0.8.9 (2017-03-07)

KOHA: 66b9bc2ca4c9619b71035408a1958572b9d82546
GITREF: f7be7f1d3738bf879d3468487dd8185f0b6245fb

- Koha:
  - DEICH-723 Branchtransfer tar ikke hensyn til reservasjoner som er satt på vent
  - Liten NL fiks (ikke en uke uten :-)
  - Sender metrikk (gir oss b.l.a overblikk hva som går treigt)
- Patron-client:
  - DEICH-671 Fiks for sett på vent funksjonalitet
  - DEICH-708 Dato filter for verk, plus layout fiks
  - DEICH-682 Realia skal kun reservers til eie bibliotek
- Services:
  - DEICH-684 Optimalisere indekseringshastighet
- Catalinker:
  - DEICH-678 Feil lenke for redigering av verk
- Infrastruktur
  - DEICH-643 Oppgradert Elsaticsearch fra 2 -> 5
  - Ny Metrikkdatabase

## 0.8.8 (2017-03-02)

KOHA: 53e98d75963bb5287d02660b7450b064428a4427
GITREF: 88d453b0cfb19276279cc2288d740d9c1075eae2

- Koha:
  - DEICH-650 fjerne begrensninger på barn når alle medier er levert
  - DEICH-639 vise begrensninger automatisk
  - DEICH-676 fiks NL bug
- Patron-client:
  - DEICH-668 visuelle forbedringer
  - DEICH-677 noen lånere får ikke opp min side
  - DEICH-674 filter fag/fiksjon fungerer ikke
  - DEICH-577 verksside viser IKKE LEDIG når det er ledige eksemplarer
  - DEICH-653 filter på utgivelsesår
- Catalinker
  - DEICH-632 splitte verk del II
  - DEICH-459 redigering av blank-node opplysninger
  - DEICH-607 fikse tab-navigering
- Services:
  - DEICH-652 redigering av autoriteter må trigge reindeksering


## 0.8.7 (2017-0)

- Koha:
  - DEICH-662 Hentenummer på automat er tilbake (igjen!)
  - DEICH-649 Feil feilmeldinger på aldersgrense i søk og på automat
  - DEICH-634 Feil i PIN - koder sendt til NL (for mange tegn i kryptert kode)
- Patron-client:
  - DEICH-395 Manglende informasjon om utgivelser i søket
  - DEICH-658 Utgivelsesår er nå fritekstssøkbart
  - DEICH-645 Feil avdelingskoder på utgivelse
  - DEICH-646 Utgivelser vises ikke etter filtrering på avdeling Skoletjenesten
  - DEICH-648 Relatert verk. Navn på hovedansvarlig vises som "undefined"
  - DEICH-663 Hovedansvarlig vises nå for verk som er emne emne
  - DEICH-665 PIN-kode validering i patron-client for å sikre at kun fire siffer benyttes
- Catalinker:
  - DEICH-102 Koble duplikate autoriteter i Catalinker
  - DEICH-535 Manglende varsel om duplikat katalogisering ved feilformatterte ISBN-nummer Katalogisering
- Other:
  - DEICH-657 Forbedret logging av RFID på skrankemaskiner

## 0.8.6 (2017-02-14)

KOHA: 3ca5d3907a0331caed3df53e0fdd1e21b1498786
GITREF:

- Koha:
  - Add patch 009a-bug17941-canBookBeRenewed (Speed improvements to Koha intra)
  - DEICH-587: NL-sync lastsync timestamp fix
  - DEICH-642: fix automatic branch transfer from automats
- Patron-client:
  - DEICH-446: My Page improvements - renew all loans and user feedback
  - DEICH-595: My Page improvements - reserves suspend can be given an expiry date
  - DEICH-629: display number in work series
  - DEICH-635: Producer should be indexed
- Catalinker:
  - DEICH-622: empty work series
  - DEICH-628: alternative term must be repeatable

## 0.8.5 (2017-02-07)

KOHA: a37d4297001cdfb21202ef2d9d04d63ff6f235f4
GITREF: ef176cca95e6703344f0df9b826229a1ccf1c6be

- Koha:
  - Koha upgraded to use 16.11.03 (security release)
  - Add Koha::Util::PureFunctions DEICH-428
    - a Cached Index for stable, idempotent Getter functions that will greatly improve the speed of Koha
  - koha installer stability fixes
  - Koha languages now configurable on startup (INSTALL_LANGUAGES, DEFAULT_LANGUAGE)
  - Disable Norwegian Patron sync by default (NLENABLE)
  - /api/v1/biblios/extended: Added some non-reservable itemtypes (e.g. SETT, )
  - /api/v1/biblios/extended: remove reservability on branchcode hsko
- Patron-client:
  - DEICH-620: fix filtering by branch on work page
  - DEICH-620: audience filter should not hide publications
  - DEICH-621: filter publication by mediatype on work page
  - DEICH-623: hide work-level filters on work page
  - DEICH-526: update generated subject/genre search links
  - DEICH-615: extra info on related works
  - DEICH-605: pre-selected branch on reservations
  - DEICH-222: add query field translations
  - DEICH-631: fix genre.subDivision = genre.specification
  - use norwegian terms for generated query links
  - use Norwegian term for series in query link
  - fix eternal loop on fetch resource errors
- Catalinker:
  - DEICH-101: split works - tidy up use of prefixes in TURTLE response
  - DEICH-566: add workId as searchable field for work
  - search work by workId also on main resource work search
- Services:
  - Add new literary form, exercise book. Add synonyms

## 0.8.4 (2017-01-31)

KOHA: 9b3c401bb0451cca4bb004efd62ef02a778d16a8
GITREF: 676a5f431ad682c968aa7176e2f83f6d2375e8a1

- Koha:
  - koha messaging-API må  bruke meldingskø DEICH-594
  - RFID forbli pålogget DEICH-603
  - RFID bedre pregings-flyt DEICH-604
  - masseendring av eksemplarer må bruke riktig rammeverk DEICH-592
  - Navn på grupper må vises i plukkliste DEICH-593
  - Slå sammen etternavn og fornavn på institusjoner DEICH-399
  - Migrert låners registreringsdato fra bibliofil DEICH-574
- Catalinker:
  - Fikse treighet som skyldes indeksering DEICH-598
  - Oppslag på treffer feil tittel DEICH-599
  - Feil sortering av autoriteter DEICH-570
  - Fiks feil der informasjon fra utgivelsesdel smitter over på hovedverk DEICH-606
- Patron-client:
  - Fjernet fuzzy søk DEICH-610
  - Mange nye søkbare felter DEICH-586
  - Verksserie vises og er søkbar DEICH-559
  - Verksrelasjoner vises DEICH-595
  - Støtte ved nulltreff DEICH-155
  - Endret rekkefølge på filtere DIECH-612


## 0.8.2 (2017-01-10)

KOHA: aa1ff583761d252e8e581fac4bd73fa6693d5a59
GITREF: 05cc85d2324e755793e4c597235dcc4a99e48070

- Koha:
  - Oppgradert til mainstream koha release 16.11.01
  - Ny meråpentfilial Bjerke
  - Nye automatfilialer: Bjerke, Nordtvet, Romsås, Bjørnholt, Smestad
  - DEICH-520: hindre at automat trigger reserveringer
  - DEICH-565: nye poster er ikke søkbare i koha
  - DEICH-463: slettede poster i catalinker legges i deletedbiblios
  - DEICH-567: kemner: endring av tapt til regning betalt skal ikke trigge innlevering
  - DEICH-516: fiks av samme purremeldinger på både sms/epost/brev
- Catalinker:
  - DEICH-362: søkbar tittel på del av utgivelse
  - DEICH-490: tillat 'Andre' som verkstype
- Patron-client:
  - DEICH-531: sortering av utgivelsesdeler
  - DEICH-537: fuzzy matching i søk, akseptere skrivefeil
  - en rekke UI-fikser for wai/universell utforming

## 0.8.1 (2017-01-04) minor update

KOHA: 15345ae973ca75a0d46cbfa8ca8433506458ae15
GITREF: 079bfab1b14387eb9b683b4a66d6700bb7fbd215

- Catalinker:
  - DEICH-533: fix not showing last of publication parts
- Patron-client:
  - DEICH-495: show parts of publication
  - fix handling empty main entry

## 0.8.0 (2016-12-20)

KOHA:   15345ae973ca75a0d46cbfa8ca8433506458ae15
GITREF: 3d80fe232e2731e97063309b3e763330b1d9dc81

- Koha:
  - DEICH-514 various fixes for NL sync
  - DEICH-512 available item status update
- Catalinker:
  - DEICH-504: New field ISSN
  - DEICH-525: New field ISMN
  - DEICH-456: work main responsibility on parts
- Patron-client:
  - DEICH-512: correcct status on not-for-loan material issued

## 0.7.5 (2016-12-13)

- Koha:
  - Fix for holds bug in SIP checkin DEICH-487
- Patron-client:
  - Forbedre visning av tittelopplysninger DEICH-508
- Catalinker:
  - Fiks mapping av opprinnelsesland fra BS DEICH-507
- Services:
  - Legg til manglende rolleDEICH-517

## 0.7.2 (2016-12-08) bugfix

- Infrastructure:
  - docker-compose upgrade: (1.9.0) and fixes
- Catalinker:
  - DEICH-90: minor title fixes
  - re-introduce illustratitveMatter field appearance for media tytpe ComicBook, LanguageCourse andE-book lost in merge

## 0.7.1 (2016-12-06) update

KOHA: c759c872b832b5517faee92dc46a2c941dfe174c

- Koha:
  - temporary fix for patron search result, redirect if one hit
- Patron-client:
  - DEICH-447: suspend and resume hold
  - DEICH-337: sorting of loans
- Services:
  - DEICH-506: use constant scoring and decrreasing boost to improve alphabetical list search
- Catalinker:
  - DEICH-497: add partNumer and partTitle to serial mapping
  - DEICH-500: allow duration longer than 24h
  - DEICH-90: authority label templating in a more uniform fashion

## 0.7.0 (2016-12-06)

KOHA: 3edb4bf7e759c00d98c4ded6392869c3b3814971

- Koha:
  - Oppgradert til mainline versjon: 16.11
    slik at vi er mer i sync med koha community
  - bruk sms proxy ved utsendelse av SMS for bedre feilsøking
  - API expanded items return number of holds
  - fixes in NL sync
  - DEICH-400: automatic limit on patrons with long overdue
- Catalinker:
  - DEICH-425: extend index mapping for work series, corporation (with place), serial (with publisher) and event (with place)
  - DEICH-497: add more fields to Serials and work series
- Patron-client:
  - DEICH-444: show number of holds per publication
  - DEICH-303: Add logged in name to header
  - DEICH-492: Reset default messaging prefs for item_due to none
  - DEICH-498: Fix default mapping of messaging prefs
  - DEICH-501: Standard messaging prefs for new registrations
- Services:
  - Include more media types for illustrative matter


## 0.6.5 (2016-11-30)

KOHA: 008a33634de04bda2287dd7fc8d89a53c7bc968d

- koha:
  - DEICH-488/DEICH-400: Fiks og forbedring av håndtering av kemnersaker
  - DEICH-431: Sletting av fjerner også fra søkeindeks
- patron-client:
  - DEICH-423: Vis alle emner på verkssiden
  - DEICH-467: Man kan nå endre henteavdeling på reservasjoner
  - DEICH-496: person/orgianisasjonslinker peker til søk (personsiden midl. avviklet)
  - DEICH-225: Fritekstsøk søker også i format og medietype
  - DEICH-303: Navn på innlogget låner synlig
- catalinker:
  - DEICH-470: Import fra BS håndterer nå alle UTF-8 tegn
  - DEICH-472: Fiks feil søkeuttrykk i verkstittel
  - DEICH-485: Fiks feil der flere verdier vises som én
  - DEICH-441: Nytt felt for verk: opprinnelsesland
  - DEICH-481: Registrere verksserie
- services:
  - DEICH-481/DEICH-225: Beskrevet over

## 0.6.2 (2016-11-24) bugfixes/extras/reverts

KOHA:   2ad15d86c314e0ef882fb9cf1eb9515f98dacf2a

- patron-client:
  - DEICH-173: Make search less strict
  - temporarily disable due to instability:
    - DEICH-445: mypage: add expected date
    - DEICH-467: Add select to change pickup location
- catalinker:
  - DEICH-460_erstatte_ui_blocker_med_spinnere
  - DEICH-482 fix prefilling of predefined values
  - DEICH-484: fix unwanted storing of suggested data
- services:
  - DEICH-475: map 025$a as EAN of publication

## 0.6.0 (2016-11-22)

GITREF: 0a4f14f4a44b89155de06d5795d8ccaea2e499bf
KOHA:   3df1e1097b2fa4d2eae7766745fc172184d2644c

- catalinker:
  - DEICH-469_manglende_oppdatering_ved_sletting_av_opplysninger
  - DEICH-471_registrerte_opplysninger_vises_ikke_i_skjema
- patron-client:
  - DEICH-466-validering_aarstall_registrering
  - DEICH-274 fix multiple items on profile page
  - DEICH-149: Add components for publication fields
  - DEICH-476: Remove Bjerke from dropdown
  - DEICH-445: mypage: add expected date
  - DEICH-467: Add select to change pickup location
- services:
  - map more 300$b values to media types


## 0.5.0 (2016-11-16)

GITREF: f7f4fbd3bcd03236e2e2f325a650a417c8e01b8e
KOHA:   3df1e1097b2fa4d2eae7766745fc172184d2644c

- koha:
  - add pickupnumber to reserves table, update schema and add pickupnumber trigger
  - boost starman workers
  - replacementprice for Spill
  - rewrite pidgeon service to use tempfiles
  - add itemnumber to reserveslip for correct generation
- sip:
  - fix for missing AO in self checkout machines
  - checkin: Override current location, set to institution ID (excluding API branch)
- patron-client:
  - update patron overview to use new pickupnumber
- catalinker:
  - fix replacing resource DEICH-435
  - when patchcing objects, do not delete empty values DEICH-462
  - add created and modified timestamp to all authorities DEICH-433
  - map 300$a as extent or number of pages depending on mediatype DEICH-427
  - fix composition type search
- services:
  - make publication class number searchable as 'kd' DEICH-161

## 0.4.0 (2016-11-10) Bugfix release

- catalinker:
  - DEICH-430_alternativt_navn_på_flere_autoriteter'

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
