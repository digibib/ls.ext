(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.esquery = factory();
  }
}(this, function () {
  "use strict"
  return {
    emptyLabel: '',
    pleaseWait: 'Vent litt...',
    close: 'Lukk',
    cancel: 'Avbryt',
    proceed: 'Fortsett',
    ignore: 'Ignorer',
    create: 'Opprett',
    done: 'Ferdig',
    part: 'Del',
    pageNumbers: 'Sidetall',
    save: 'Lagre',
    delete: 'Slett',
    noHits: 'Ingen treff',
    selectAll: 'Velg alle',
    by: 'av',
    selectThis: 'Velg',
    showHideRelations: 'Vis/skjul relasjoner',
    show: 'vis',
    hide: 'skjul',
    showEsotericFieldsSupportLegend: 'Noen felter vises ikke fordi de sjelden brukes i denne sammenhengen:',
    selectWorkLabel: 'Katalogisér utgivelse av dette verket',
    autoNumber: 'Automatisk nummerering',
    searchWorkLegend: 'Søk etter tittel, hovedinnførsel, verksuri eller -id',
    workTitlePlaceHolder: 'Verkstittel/verksID',
    searchPublicationLegend: 'Søk etter tittel eller tittelnummer',
    advancedSearchLegend: 'Du bruker nå <span class="more-info" title="Søk som inneholder et av disse tegnene {{advancedSearchCharacters()}}. Du kan også bruke AND, OR og NOT.">avansert søk</span>. Trykk Enter for å søke.',
    useSuggestion: 'Bruk forslag',
    deleteEntry: 'Slett oppføring',
    editEntry: 'Rediger oppføring',
    defaultAddAnotherLabel: 'Legg til',
    addAnotherPageNumber: 'Legg til et sidetall',
    addAnotherExtent: 'Legg til et omfang',
    addAnotherISBN: 'Legg til nytt ISBN',
    addAnotherISMN: 'Legg til nytt ISMN',
    addAnotherEAN: 'Legg til nytt EAN',
    addAnotherPublisher: 'Legg til ny utgiver',
    addAnotherSeries: 'Legg til ny serie',
    addAnotherRelation: 'Legg til en relasjon til',
    addAnotherWorkSeries: 'Legg til ny verksserie',
    addAnotherCompositionType: 'Legg til en komposisjonstype til',
    addAnotherInstrument: 'Legg til et instrument til',
    addAnotherSubject: 'Legg til et emne til',
    addAnotherClassification: 'Legg til en klassifikasjon til',
    addAnotherGenre: 'Legg til en sjanger til',
    addAnotherPart: 'Legg til en del til',
    addAnotherAdditionalEntry: 'Legg til ny biinnførsel',
    addAnotherVariantTitle: 'Legg til en alternativ tittel til',
    addAnotherTag: 'Legg til et stikkord til',
    addAnotherAlternativeName: 'Legg til et alternativt navn til',
    suggestionFromOtherSources: 'Forslag fra andre eksterne kilder',
    missingRequiredValuesOfBlankMode: 'Kan ikke legge til før {{subjectTypeLabelDet(subjectType)}} er opprettet eller lastet. Påkrevde felter må være utfylt eller ha valgt autoritet/fast verdi.',
    cannotSelectRelationBeforeResourceTypeIsLoaded: 'Denne knytningen kan ikke velges før tilhørende ressurstype er lastet',
    nameLabel: 'Navn',
    mainEntryLabel: 'Hovedinnførsel',
    authorLabel: 'Forfatter',
    ISBNLabel: 'ISBN',
    EANLabel: 'EAN',
    missingMainEntryLabel: 'Verket har ikke hovedansvarlig',
    mainContributorLabel: 'Hovedansvarlig',
    agentLabel: 'Aktør',
    improperWorkLabel: 'Skal ikke inngå i verksliste',
    searchWorkAsMainResourceLabel: 'Søk etter eksisterende verk',
    publicationTabLabel: 'Beskriv utgivelse',
    seriesLabel: 'Serie',
    seriesTitleLabel: 'Serietittel',
    seriesPartNumber: 'Nummer på delserie',
    subSeriesTitle: 'Tittel på delserie',
    issueNumberLabel: 'Nummer i serien',
    publishedByLabel: 'Utgiver',
    workTabLabel: 'Beskriv verk',
    workSeriesWorkLabel: 'Relatert til',
    relationTypeLabel: 'Type relasjon',
    publicationYearLabel: 'År',
    originCountryLabel: 'Opprinnelsesland',
    subjectsTabLabel: 'Emneopplysninger',
    instrumentationLabel: 'Besetning',
    selectSubjectType: 'Velg emnetype',
    selectActorType: 'Velg type aktør',
    numberOfPerformersLabel: 'Antall utøvere',
    classificationLabel: 'Klassifikasjon',
    classificationSourceLabel: 'Utgave',
    publicationPartsTabLabel: 'Beskriv deler',
    publicationPartsLabel: 'Deler som inngår i samling',
    pubPartMainTitleLabel: 'Tittel på del',
    bulkEntryLinkLabel: 'Masseregistrering',
    bulkEntryLinkToolTip: 'Åpne mulighet for å legge inn flere titler på én gang',
    enableBulkEntryLegend: `
                          Legg inn titler på delene her med et linjeskift mellom hver. Når du trykker på "Legg til",
                          opprettes en utgivelesedel for hver tittel. Tomme linjer blir ignorert. Hver del får også
                          knyttet til seg samme aktør og rolle hvis det er angitt over. Hvis du ikke vil ha automatisk
                          nummerering av deler som opprettes, fjerner du krysset for det valget nedenfor.
                          `,
    additionalEntriesTabLabel: 'Biinnførsler',
    additionalEntryLabel: 'Biinnførsel',
    workRelationLabel: 'Relasjon til annet verk eller verksserie',

    // index type labels
    personLabel: 'Person',
    generalSubjectLabel: 'Generelt',
    workLabel: 'Verk',
    genreLabel: 'Sjanger',
    corporationLabel: 'Organisasjon',
    placeLabel: 'Sted',
    eventLabel: 'Hendelse',
    serialLabel: 'Serie',
    publicationLabel: 'Utgivelse',
    instrumentLabel: 'Instrument',
    workSeriesLabel: 'Verksserie',
    compositionTypeLabel: 'Komposisjonstype',

    // type explanations
    personExplanation: '(Person)',
    generalSubjectExplanation: '(Generelt emne)',
    workExplanation: '(Verk)',
    genreExplanation: '(Sjanger)',
    corporationExplanation: '(Organisasjon)',
    placeExplanation: '(Sted)',
    eventExplanation: '(Hendelse)',
    serialExplanation: '(Serie)',
    publicationExplanation: '(Utgivelse)',
    instrumentExplanation: '(Instrument)',
    workSeriesExplanation: '(Serie)',
    compositionTypeExplanation: '(Komposisjonstype)',

    // determinatives
    PersonLabelDet: 'personen',
    GeneralSubjectLabelDet: 'emnet',
    WorkLabelDet: 'verket',
    GenreLabelDet: 'sjangeren',
    CorporationLabelDet: 'organisasjonen',
    PlaceLabelDet: 'stedet',
    EventLabelDet: 'hendelsen',
    SerialLabelDet: 'serien',
    PublicationLabelDet: 'utgivelsen',
    InstrumentLabelDet: 'instrumentet',
    WorkSeriesLabelDet: 'verksserien',
    CompositionTypeLabelDet: 'komposisjonstypen',

    // demonstratives
    PersonLabelDem: 'denne personen',
    GeneralSubjectLabelDem: 'dette emnet',
    WorkLabelDem: 'dette verket',
    GenreLabelDem: 'denne sjangeren',
    CorporationLabelDem: 'denne organisasjonen',
    PlaceLabelDem: 'dette stedet',
    EventLabelDem: 'denne hendelsen',
    SerialLabelDem: 'denne serien',
    PublicationLabelDem: 'denne utgivelsen',
    InstrumentLabelDem: 'dette instrumentet',
    WorkSeriesLabelDem: 'denne verksserien',
    CompositionTypeLabelDem: 'komposisjonstypen',

    // indeterminativ
    PersonLabel: 'person',
    GeneralSubjectLabel: 'emne',
    WorkLabel: 'verk',
    GenreLabel: 'sjanger',
    CorporationLabel: 'organisasjon',
    PlaceLabel: 'sted',
    EventLabel: 'hendelse',
    SerialLabel: 'serie',
    PublicationLabel: 'utgivelse',
    InstrumentLabel: 'instrument',
    WorkSeriesLabel: 'verksserie',
    CompositionTypeLabel: 'komposisjonstype',
    PublicationPartLabel: 'del av utgivelse',

    // pluralis
    PersonLabelPlur: 'personene',
    GeneralSubjectLabelPlur: 'emnene',
    WorkLabelPlur: 'verkene',
    GenreLabelPlur : 'sjangrene',
    CorporationLabelPlur : 'organisasjonene',
    PlaceLabelPlur : 'stedene',
    EventLabelPlur : 'hendelsene',
    SerialLabelPlur: 'seriene',
    PublicationLabelPlur : 'utgivelsene',
    InstrumentLabelPlur: 'instrumentene',
    WorkSeriesLabelPlur: 'verksseriene',
    CompositionTypeLabelPlur : 'komposisjonstypene',

    // maintenance search field labels
    maintPersonLabelPlur: 'Personer',
    maintCorporationLabelPlur : 'Organisasjoner',
    maintGeneralSubjectLabelPlur: 'Emner',
    maintPlaceLabelPlur: 'Steder',
    maintEventLabelPlur: 'Hendelser',
    maintGenreLabelPlur: 'Sjangre',
    maintSerialLabelPlur: 'Forlagsserier',
    maintWorkSeriesLabelPlur: 'Verksserier',
    maintInstrumentLabelPlur: 'Instrumenter',
    maintCompositionTypeLabelPlur: 'Komposisjonstyper',
    maintPublicationLabelPlur: 'Utgivelser',
    maintWorkLabelPlur: 'Verk',

    // create resource buttons
    createNewWorkLabel: 'Opprett nytt verk',
    createNewWorkSeriesLabel: 'Opprett ny verksserie',
    createNewPlaceLabel: 'Opprett nytt sted',
    createNewEventLabel: 'Opprett ny hendelse',
    createNewSeriesLabel: 'Opprett ny serie',
    createNewInstrumentLabel: 'Opprett nytt musikkinstrument',
    createNewCompositionTypeLabel: 'Opprett ny komposisjonstype',
    createNewPersonLabel: 'Opprett ny person',
    createNewCorporationLabel: 'Opprett ny organisasjon',
    createNewGenreLabel: 'Opprett ny sjanger',
    createNewSubjectLabel: 'Opprett nytt generelt emne',

    // next step buttons
    nextStepDescription: 'Neste steg: Beskrivelse',
    nextStepDescribeWork: 'Neste steg: Beskriv verk',
    nextStepSubjects: 'Neste steg: Emneopplysninger',
    nextStepDescribeParts: 'Neste steg: Beskriv deler',
    nextStepAdditionalEntries: 'Neste steg: Biinnførsler',
    finishRegisterPublication: 'Avslutt registrering av utgivelsen',

    // other buttons
    deletePublication: 'Slett utgivelsen',
    deleteWork: 'Slett verket',
    changeWorkOfPublication: 'Endre verk for utgivelse',
    confirmChangeWorkOfPublication: 'Er du sikker på at du vil endre verksknytningen for denne utgivelsen?',
    extendedEdit: 'Utvidet redigering',

    // dialogs
    // delete publication
    deletePublicationDialogTitle: 'Slett utgivelse',
    confirmDeletePublication: 'Bekreft sletting av utgivelse',
    confirmDeletePublicationDetail: 'Ja, jeg vil gjerne slette denne utgivelsen:',
    publicationDeleted: 'Utgivelsen {{title}} av verket {{work}} er slettet',
    deletePublicationFailed: 'Kunne ikke slette utgivelsen',
    itemsLeftMessage: 'Det er {{numberOfItemsLeft}} eksemplarer knyttet til den i Koha.',
    gotoKohaForDeleteLink: `Gå til <a data-automation-id="biblio_record_link" target="_blank"
               href="{{config.kohaIntraUri}}/cgi-bin/koha/catalogue/detail.pl?biblionumber={{publicationId()}}"
               class="link">utgivelsen der</a> og fjern eksemplarene først.
    `,

    // delete authority
    deleteAuthorityDialogTitle: 'Slett autoritet',
    deleteAuthorityLegend: 'Bekreft sletting av autoritet',
    authorityNumberOfReferences: 'Denne autoriteten er referert i {{references}} sammenheng{{#references > 1}}er{{/}}.',
    confirmDeleteAuthority: 'Ja, jeg vil gjerne slette denne autoriteten.',
    authorityDeleted: 'Autoriteten er slettet',
    deleteAuthorityFailed: 'Kunne ikke slette autoriteten',

    // delete work
    deleteWorkDialogTitle: 'Slett verk',
    cannotDeleteWorkForReferences: 'Dette verket kan ikke slettes fordi det inngår i {{references}} sammenhenger:',
    confirmDeleteWork: 'Bekreft sletting av verk',
    confirmDeleteWorkDetail: 'Ja, jeg vil gjerne slette dette verket:',
    workDeleted: 'Verket {{title}} er slettet',
    workDeleteFailed: 'Kunne ikke slette verket',
    workDeleteFailedPublicationsLeft: 'Det er {{numberOfPublicationsLeft}} utgivelser knyttet til det.',

    // edit authority
    confirmEditResource: 'Er du sikker på at du vil endre {{fieldLabel}} på  {{rdfType + \'LabelDet\'}}',

    // task descriptions
    filmPub: 'Katalogisering av filmutgivelse',
    comicPub: 'Katalogisering av tegneserieutgivelse',
    aBookPub: 'Katalogisering av lydbokutgivelse',
    eBookPub: 'Katalogisering av e-bokutgivelse',
    bookPub: 'Katalogisering av bokutgivelse',
    langCourse: 'Katalogisering av språkkurs',
    gamePub: 'Katalogisering av spill',
    sheetMusPub: 'Katalogisering av musikknoter',
    musRecPub: 'Katalogisering av musikkopptak',
    maintWork: 'Vedlikeholde verk',
    maintPub: 'Vedlikeholde utgivelse',
    editPerson: 'Utvidet redigering av personautoritet',
    editCorporation: 'Utvidet redigering av organisasjonsautoritet',
    editSubject: 'Utvidet redigering av emneautoritet',
    editPlace: 'Utvidet redigering av stedsautoritet',
    editSerial: 'Utvidet redigering av forlagsserie',
    editWorkSeries: 'Utvidet redigering av verksserie',
    editInstrument: 'Utvidet redigering av instrumentautoritet',
    editCompositionType: 'Utvidet redigering av komposjonstype',
    comparePerson: 'Sammenlikne og slå sammen personautoritet',
    compareCorporation: 'Sammenlikne og slå sammen organisasjonsautoritet',
    compareSubject: 'Sammenlikne og slå sammen emneautoritet',
    comparePlace: 'Sammenlikne og slå sammen stedsautoritet',
    compareSerial: 'Sammenlikne og slå sammen forlagsserie',
    compareWorkSeries: 'Sammenlikne og slå sammen verksserie',
    compareInstrument: 'Sammenlikne og slå sammen instrumentautoritet',
    compareCompositionType: 'Sammenlikne og slå sammen komposjonstype',
    compareWork: 'Sammenlikne og slå sammen verk',

    // menu
    menuHeading: 'Katalogisering og vedlikehold av samlingen',
    newMaterial: 'Nytt materiale',
    authorityMaintenance: 'Vedlikehold av autoriteter',

    // external data
    guessedSearchParameterLegend: 'Det ser ut som du ønsker å søke etter <b>{{>parameterGuess}}</b>.<br/>Du kan presisere søkebegrepet ved å prefikse med én av disse ccl-kodene: {{cclCodes}}.',
    DFBSearchLabel: 'Søk i Det flerspråklige bibliotek',
    DFBPlaceHolderISBN: 'ISBN/tittel/forfatter/lokalt postnummer',
    DFBPlaceHolderEAN: 'EAN/tittel/forfatter/lokalt postnummer',
    BSSearchLabel: 'Søk i Biblioteksentralen',
    titleLabel: 'Tittel',
    localIdlabel: 'Lokalt postnummer',
    hitsFromExternalSource: '{{items.length}}{{#if items.length !== totalHits}} av {{totalHits}}{{/if}} treff i ekstern kilde - {{../../preferredSource.name}}',
    invalidEanNumber: 'Dette ser ikke ut som et gyldig EAN-nummer',
    invalidIsbnNumber: 'Dette ser ikke ut som et gyldig ISBN-nummer',
    alreadyRegisteredEANPlural: 'Det finnes allerede ${numberOfResources} registrerte utgivelser med samme EAN-nummer. Vil du åpne en av disse, fortsette med nyregistrering likevel, eller avbryte registreringen?',
    alreadyRegisteredEANSingular: 'Det finnes allerede en registrert utgivelse med samme EAN-nummer. Vil du åpne den, fortsette med nyregistrering likevel, eller avbryte registreringen?',
    searchUnavailableBecauseOfAcceptedExternalItem: 'Du kan ikke utføre nytt eksternt søk etter at et forslag er tatt i bruk',
    noHitsInExternalSource: 'Ingen treff i eksterne kilder',
    additionalSuggestionsLegend: `
        <p>Klikk <b>Bruk forslag</b> for å fylle inn {{allowPartialSuggestions ? numberOfSuggestionsForGroup : numberOfSuggestionsForGroup - numberOfInCompleteForGroup}}
        verdi{{#if (allowPartialSuggestions ? numberOfSuggestionsForGroup : numberOfSuggestionsForGroup - numberOfInCompleteForGroup) > 1}}er{{/if}}.</p>
        `,
    externalSuggestionsAlreadyUsed: 'Forslag fra ekstern hovedkilde er allerede hentet inn',
    showHideFromExternalSources: '{{#if expanded}}Skjul{{else}}Se{{/if}} forslag fra {{#if !suggestionsAreDemoted}}andre {{/if}} eksterne kilder',
    useValuesFromThis: 'Bruk verdiene fra denne',
    thisPublicationIsAlreadyRegistered: 'Denne utgivelsen finnes fra før',
    alreadyRegisteredISBNSingular: 'Det finnes allerede en registrert utgivelse med samme ISBN-nummer. Vil du åpne den, fortsette med nyregistrering likevel, eller avbryte registreringen?',
    alreadyRegisteredISBNPlural: 'Det finnes allerede {{numberOfResources}} registrerte utgivelser med samme ISBN-nummer. Vil du åpne en av disse, fortsette med nyregistrering likevel, eller avbryte registreringen?',
    suggestedPrefilledValues: 'Forslag til forhåndsfylte verdier',
    useValuesFromTheseFields: 'Vil du bruke verdiene fra disse feltene:',
    andFillTheEmptyFields: '...til å fylle inn tomme felter for disse:',
    unknownPredefinedValuesMessage: `Verdien fra {{unknownPredefinedValues.sourceLabel}}, "{{unknownPredefinedValues.values.join(',')}}",
                finnes ikke blant de mulige verdiene for <b>{{#if labelKey}}{{>labelKey}}{{else}}{{label}}{{/if}}</b >.<br/>
                Velg det som passer best fra verdiene i nedtrekkslisten.
    `,

    // extended editing
    worksAndPubsRelatedToAuthority: 'Verk og utgivelser knyttet til {{applicationData.translations[applicationData.language][rdfType + \'LabelDet\']}}:',
    searchForDuplicates: 'Søk etter duplikater',
    noRelations: 'Ingen relasjoner',
    cannotMergeWithSelf: 'Du kan ikke slå sammen med samme {{applicationData.translations[applicationData.language][rdfType + \'LabelDet\']}} som du redigerer.',
    mergeAuthoritiesLegend: `Hvis du velger å slå sammen disse to {{applicationData.translations[applicationData.language][rdfType + 'LabelPlur']}} til én, 
                    flyttes alle relasjonene som {{applicationData.translations[applicationData.language][rdfType + 'LabelDet']}} til <b>høyre</b> inngår i
                    over til {{applicationData.translations[applicationData.language][rdfType + 'LabelDet']}} på <b>venstre</b> siden. 
                    Informasjonen i feltene til <b>venstre</b> beholdes, mens informasjonen i feltene til <b>høyre</b> slettes. 
                    Pass derfor på at all ønskelig informasjon fra {{applicationData.translations[applicationData.language][rdfType + 'LabelDet']}} til <b>høyre</b>
                    er overført til {{applicationData.translations[applicationData.language][rdfType + 'LabelDet']}} til <b>venstre før</b> du slår dem sammen.
`,//
    mergeAuthButtonLabel: 'Slå sammen disse to {{applicationData.translations[applicationData.language][rdfType + \'LabelPlur\']}}',
    mergeResourcesDialogTitle: 'Slå sammen autoriteter',
    addMoreValuesInExtendedEditing: 'Du kan legge til flere verdier i utvidet redigering',

    // split work
    showPublicationsAndSplitWork: 'Vis utgivelser/splitte verk',
    splitTheWork: 'Splitt verket',
    splitWork: 'Splitte verk',
    makeWorkCopyForEachPubliation: 'Lag en kopi av verket for hver utgivelse og knytt utgivelsene til de nye verkene',
    workHasNoPublications: 'Verket har ingen utgivelser.',
    workHasNumberOfPublications: 'Verket har {{numberOfRelations}} utgivelse{{numberOfRelations !== 1 ? \'r\' : \'\'}}:',
    splitWorkLegend: `Hvis du velger å splitte verket, opprettes det en ny kopi av det for hver utgivelse som er valgt over. Hver utgivelse knyttes
                  deretter til sitt nye verk som utgivelse av det verket. Før verket splittes blir du bedt om å angi hvilke verdier
                  fra utgivelsene som skal overføres til tilsvarende felt på de nye verkene.`,
    splitWorkDialogLegend: 'Velg hvilke verdier som skal kopieres fra de eksisterende utgivelsene til de nye verkene som skal opprettes:',

    // copy publication
    copyPublicationButtonLabel: 'Kopier utgivelse og verk',
    copyPublicationWarningDialogLegend: 'Er du sikker på at du vil kopiere denne utgivelsen?',
    copyPublicationWarningDialogExplanation: 'Dette vil opprette en ny utgivelse og et nytt verk.',
    copyPublicationDialogTitle: 'Kopiere utgivelse og verk',
    progressCopyingPublication: 'Kopierer utgivelse...',
    progressCopyingWork: 'Kopierer verk...',
    progressConnectingPubToWork: 'Kobler utgivelse til nytt verk...',
    progressCopyingDone: 'Klikk OK for å åpne den nye kopien av utgivelsen nå eller Avbryt for å fortsette med originalen.<p>Du kan også <a target="_blank" href="/cataloguing?template=workflow&openTab=1&copy=true&Publication={{clonedPublicationUri}}">åpne kopien i en ny fane.</a></p>',
    copyPublicationFailed: 'Noe gikk galt under kopiering. Forsøk igjen senere.',

    // links
    showWorkPageLink: 'Vis siden for verket',
    showTURTLEForWorkLink: 'Vis lenkede data i TURTLE-format for verket',
    showPublicationInKohaLink: 'Vis utgivelsen i Koha',
    showSummaryLink: 'Vis katalogiserte data for utgivelsen',

    // status messages
    statusOpenedExistingResource: 'åpnet eksisterende ressurs',
    statusWorking: 'arbeider...',
    statusSaved: 'alle endringer er lagret',

    // labels for inverse relations
    'http://data.deichman.no/ontology#subject_inverse': 'Verk med {{#if subjectType == "Subject"}}dette emnet{{else}}{{>subjectType + "LabelDem"}} som emne{{/if}}',
    'http://data.deichman.no/ontology#publicationOf_inverse': 'Utgivelser av dette verket',
    'http://data.deichman.no/ontology#hasPublicationPart_inverse': 'Utgitt som del',
    'http://data.deichman.no/ontology#inSerial_inverse': 'Utgivelser i denne serien',
    'http://data.deichman.no/ontology#isPartOfWorkSeries_inverse': 'Verk i denne serien',
    'http://data.deichman.no/ontology#genre_inverse': 'Verk i denne sjangeren',
    'http://data.deichman.no/ontology#hasPlaceOfPublication_inverse': 'Utgitt på dette stedet',
    'http://data.deichman.no/ontology#isRelatedTo_inverse': 'Verk relatert til dette',
    'http://data.deichman.no/ontology#hasInstrumentation_inverse': 'Verk med dette instrumentet',
    'http://data.deichman.no/ontology#hasCompositionType_inverse': 'Verk med denne komposisjonstypen',
    'http://data.deichman.no/relationType#partOf_inverse': 'Verk som er del av dette',
    'http://data.deichman.no/relationType#relatedWork_inverse': 'Verk som er relatert til dette',
    'http://data.deichman.no/relationType#continuationOf_inverse': 'Verk som dette er en fortsettelse av',
    'http://data.deichman.no/relationType#continuedIn_inverse': 'Verk som er del av dette',
    inverseRoleRelation: 'Verk/utgivelser med {{>subjectType + "LabelDem"}} som {{role.toLowerCase()}}',

    // misc
    partsLabel: 'Deler',
    inputTooLong: 'Vennligst fjern {{overChars}} tegn',
    inputTooShort: 'Vennligst skriv inn minst {{minimum}} tegn',
    loadingMore: 'Laster flere resultater…',
    maximumOneCanBeSelected: 'Du kan bare velge én verdi her',
    maximumSelected: 'Du kan velge maks {{maximum}} verdier her',
    noResults: 'Ingen treff',
    searching: 'Søker…',
    copiedFrom: 'Fra {{>copiedFromType + "LabelDet"}}',
    copiedFromLegend: 'Verdien i dette feltet er kopiert fra {{copiedFromLabel}} på {{>copiedFromType + "LabelDet"}}',
    acceptedStringFormat: 'Verdier kan ikke starte eller slutte med mellomrom',
    yes: 'Ja',
    no: 'Nei'
  }
}))
