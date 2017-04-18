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
    pleaseWait: 'One moment...',
    close: 'Close',
    cancel: 'Cancel',
    proceed: 'Proceed',
    ignire: 'Ignore',
    create: 'Create',
    done: 'Done',
    part: 'Part',
    pageNumbers: 'Pages',
    save: 'Save',
    delete: 'Delete',
    noHits: 'No hits',
    selectAll: 'Select all',
    by: 'by',
    selectThis: 'Select this',
    autoNumber: 'Automatic numbering',
    searchWorkLegend: 'Search by title, main entry, work uri or work id',
    searchPublicationLegend: 'Search by title of record id',
    advancedSearchLegend: 'You are using <span class="more-info" title="Search containg any of these characters: {{advancedSearchCharacters()}}. You can also use AND, OR og NOT.">advanced search</span>. Press Enter to search.',
    useSuggestion: 'Use suggestion',
    deleteEntry: 'Delete entry',
    editEntry: 'Edit entry',
    defaultAddAnotherLabel: 'Add',
    addAnotherPageNumber: 'Add a page number',
    addAnotherExtent: 'Add extent',
    addAnotherISBN: 'Add another ISBN',
    addAnotherISMN: 'Add another ISMN',
    addAnotherSeries: 'Add another series',
    addAnotherRelation: 'Add another relation',
    addAnotherWorkSeries: 'Add new work series',
    addAnotherCompositionType: 'Add another composition type',
    addAnotherInstrument: 'Add another instrument',
    addAnotherSubject: 'Add another subject',
    addAnotherClassification: 'Add another classification',
    addAnotherGenre: 'Add another genre',
    addAnotherPart: 'Add another part',
    addAnotherAdditionalEntry: 'Add another additional entry',
    suggestionFromOtherSources: 'Suggestion from another external source',
    missingRequiredValuesOfBlankMode: 'Can not add until {{subjectTypeLabelDet(subjectType)}} has been created or loaded. mandatory fields must be yada yada yada.',
    cannotSelectRelationBeforeResourceTypeIsLoaded: 'Can\'t make this association before relevant resource type has been loaded', //Denne knytningen kan ikke velges før tilhørende ressurstype er lastet
    nameLabel: 'Name', // Navn
    mainEntryLabel: 'Main entry', // Hovedinnførsel
    ISBNLabel: 'ISBN',
    EANLabel: 'EAN',
    missingMainEntryLabel: 'The work doesn\'t have main responsible', // Verket har ikke hovedansvarlig
    mainContributorLabel: 'Main responsible', // Hovedansvarlig
    agentLabel: 'Agent', // Aktør
    improperWorkLabel: 'Not part of list of works', // Skal ikke inngå i verksliste
    searchWorkAsMainResourceLabel: 'Search for existing work', // Søk etter eksisterende verk
    publicationTabLabel: 'Describe publication', // Beskriv utgivelse
    seriesLabel: 'Series', // Serie
    seriesTitleLabel: 'Series title', // Serietittel
    seriesPartNumber: 'Series part number', // Nummer på delserie
    issueNumberLabel: 'Number in series', // Nummer i serien
    subSeriesTitle: 'Sub series title', // Tittel på delserie,
    workTabLabel: 'Describe work', // Beskriv verk
    workSeriesWorkLabel: 'Work',
    relationTypeLabel: 'Relation type',
    publishedByLabel: 'Publisher', // Utgiver,
    publicationYearLabel: 'Year', // År
    originCountryLabel: 'Country of origin',  // Opprinnelsesland
    subjectsTabLabel: 'Subjects', // Emneopplysninger
    instrumentationLabel: 'Intrumentation', // Besetning
    selectSubjectType: 'Select subject type',
    selectActorType: 'Select actor type',
    numberOfPerformarsLabel: 'Number of performers', // Antall utøvere
    classificationLabel: 'Classification', // Klassifikasjon
    classificationSourceLabel: 'Classification source', // Utgave
    publicationPartsTabLabel: 'Describe parts', // Beskriv deler
    publicationPartsLabel: 'Parts', // Deler som inngår i samling
    pubPartMainTitleLabel: 'Part title', // Tittel på del
    bulkEntryLinkLabel: 'Add multiple titles',
    bulkEntryLinkToolTip: 'Add multiple parts in one operation', // Åpne mulighet for å legge inn flere titler på én gang'
    enableBulkEntryLegend: `Enter part titles here separated by carriage return. When you click "Add", one publication part
                            is created for each title. Empty lines are ignored. Every part is also associated with same agent
                            and role if entered above. If you do not want autonumbering of parts created, uncheck selection below 
                            `,
//                          Legg inn titler på delene her med et linjeskift mellom hver. Når du trykker på "Legg til",
//                          opprettes en utgivelesedel for hver tittel. Tomme linjer blir ignorert. Hver del får også
//                          knyttet til seg samme aktør og rolle hvis det er angitt over. Hvis du ikke vil ha automatisk
//                          nummerering deler som opprettes, fjerner du krysset for det valget nedenfor.

    additionalEntriesTabLabel: 'Additional entries',
    additionalEntryLabel: 'Additional entry',
    workRelationLabel: 'Relation to other work', // Relasjon til annet verk'

    // index type labels
    personLabel: 'Person',
    generalSubjectLabel: 'General subject',
    workLabel: 'Work',
    genreLabel: 'Genre',
    corporationLabel: 'Corporation',
    placeLabel: 'Place',
    eventLabel: 'Event',
    serialLabel: 'Serial',
    publicationLabel: 'Publication',
    instrumentLabel: 'Instrument',
    workSeriesLabel: 'Work series',
    compositionTypeLabel: 'Composition type',

    // determinativ
    PersonLabelDet: 'the person',
    GeneralSubjectLabelDet: 'the subject',
    WorkLabelDet: 'this work',
    GenreLabelDet: 'the genre',
    CorporationLabelDet: 'the corporation',
    PlaceLabelDet: 'the place',
    EventLabelDet: 'the event',
    SerialLabelDet: 'the serial',
    PublicationLabelDet: 'the publication',
    InstrumentLabelDet: 'the instrument',
    WorkSeriesLabelDet: 'the work series',
    CompositionTypeLabelDet: 'the composition type',

    // indeterminativ
    PersonLabel: 'person',
    GeneralSubjectLabel: 'subject',
    WorkLabel: 'work',
    GenreLabel: 'genre',
    CorporationLabel: 'corporation',
    PlaceLabel: 'place',
    EventLabel: 'event',
    SerialLabel: 'serial',
    PublicationLabel: 'publication',
    InstrumentLabel: 'instrument',
    WorkSeriesLabel: 'work series',
    CompositionTypeLabel: 'composition type',

    // pluralis
    PersonLabelPlur: 'persons',
    GeneralSubjectLabelPlur: 'subjects',
    WorkLabelPlur: 'works',
    GenreLabelPlur : 'genres',
    CorporationLabelPlur : 'corporations',
    PlaceLabelPlur : 'places',
    EventLabelPlur : 'events',
    SerialLabelPlur: 'serials',
    PublicationLabelPlur : 'publications',
    InstrumentLabelPlur: 'instruments',
    WorkSeriesLabelPlur: 'work series',
    CompositionTypeLabelPlur : 'composition types',

    // maintenance search field labels
    maintPersonLabelPlur: 'People',
    maintCorporationLabelPlur : 'Corprations',
    maintGeneralSubjectLabelPlur: 'Subjects',
    maintPlaceLabelPlur: 'Places',
    maintEventLabelPlur: 'Events',
    maintGenreLabelPlur: 'Genres',
    maintSerialLabelPlur: 'Publisher series',
    maintWorkSeriesLabelPlur: 'Work series',
    maintInstrumentLabelPlur: 'Instruments',
    maintCompositionTypeLabelPlur: 'Composition types',
    maintPublicationLabelPlur: 'Publications',
    maintWorkLabelPlur: 'Works',

    // create resource buttons
    createNewWorkLabel: 'Create new work', // Opprett nytt verk
    createNewWorkSeriesLabel: 'Create new work series', // Opprett ny verksserie
    createNewPlaceLabel: 'Create new place', // Opprett nytt sted
    createNewEventLabel: 'Create new event', // Opprett ny hendelse
    createNewSeriesLabel: 'Create new series', // Opprett ny serie
    createNewInstrumentLabel: 'Create new instruent', // Opprett nytt musikkinstrument
    createNewCompositionTypeLabel: 'Create new composition type', // Opprett ny komposisjonstype
    createNewPersonLabel: 'Create new person', // Opprett ny person
    createNewCorporationLabel: 'Create new corporation',
    createNewGenreLabel: 'Create new genre',
    createNewSubjectLabel: 'Create new subject', // Opprett nytt generelt emne

    // next step buttons
    nextStepDescription: 'Next step: Description',
    nextStepDescribeWork: 'Next step: Describe work',
    nextStepSubjects: 'Next step: Subjects',
    nextStepDescribeParts: 'Next step: Describe parts',
    nextStepAdditionalEntries: 'Next step: Additonal entries',
    finishRegisterPublication: 'Finish',

    // other buttons
    deletePublication: 'Delete this publication',
    deleteWork: 'Delete this work',
    changeWorkOfPublication: 'Replace work of publication',
    confirmChangeWorkOfPublication: 'Are you sure you wish to change the work relation of this publication?', // Er du sikker på at du vil endre verksknytningen for denne utgivelsen?
    extendedEdit: 'Extended editing',

    // dialogs
    // delete publication
    deletePublicationDialogTitle: 'Delete publication',
    confirmDeletePublication: 'Confirm delete publication',
    confirmDeletePublicationDetail: 'Yes, I do want to delete this publication:',
    publicationDeleted: 'The publication {{title}} of the work {{work}} is deleted',
    deletePublicationFailed: 'Could not delete the publication',
    itemsLeftMessage: 'There are {{numberOfItemsLeft}} items registered in Koha.',
    gotoKohaForDeleteLink: `Go to <a data-automation-id="biblio_record_link" target="_blank"
               href="{{config.kohaIntraUri}}/cgi-bin/koha/catalogue/detail.pl?biblionumber={{publicationId()}}"
               class="link">the publication there</a> and remove the items first.
    `,

    // merge authorities
    mergeResourcesDialogTitle: 'Merge authorities',
    useValuesFromTheseFields: 'Do you wish to use the values from these fields:', // Vil du bruke verdiene fra disse feltene:
    andFillTheEmptyFields: '...to fill the empty fields for these:', // ...til å fylle inn tomme felter for disse:

    // delete authority
    deleteAuthorityDialogTitle: 'Delete authority',
    deleteAuthorityLegend: 'Confirm delete authority',
    authorityNumberOfReferences: 'This authority is referred to in {{references}} context{{#references > 1}}s{{/}}.',
    confirmDeleteAuthority: 'Yes, I want to delete this authority.',
    authorityDeleted: 'The authority is deleted',
    deleteAuthorityFailed: 'Could not delete this authority',

    // delete work
    deleteWorkDialogTitle: 'Delete work',
    cannotDeleteWorkForReferences: 'This work cannot be deleted because there {{references > 1 ? \'are\' : \'is\'}} {{references}} references to it:',
    confirmDeleteWork: 'Confirm delete work',
    confirmDeleteWorkDetail: 'Yes, I wish to delete this work:',
    workDeleted: '{{title}} is deleted',
    workDeleteFailed: 'Could not delete the work',
    workDeleteFailedPublicationsLeft: 'There {{numberOfPublicationsLeft > 1 ? \'are\' : \'is\'}} {{numberOfPublicationsLeft}} publications of it.',

    // edit authority
    confirmEditResource: 'Are you certain you wish to edit {{fieldLabel}} of {{rdfType + \'LabelDet\'}}',

    // task descriptions
    filmPub: 'Cataloguing film',
    comicPub: 'Cataloguing comic book',
    aBookPub: 'Cataloguing audio recording',
    eBookPub: 'Cataloguing e-book',
    bookPub: 'Cataloguing book',
    langCourse: 'Cataloguing language course',
    gamePub: 'Cataloguing game',
    sheetMusPub: 'Cataloguing musical score',
    musRecPub: 'Cataloguing musical recording',
    maintWork: 'Maintain work',
    maintPub: 'Maintain publication',
    editPerson: 'Edit person authority',
    editCorporation: 'Edit organisation authority',
    editSubject: 'Edit subject authority',
    editPlace: 'Edit place authority',
    editSerial: 'Edit series',
    editWorkSeries: 'Edit work series',
    editInstrument: 'Edit instrument authority',
    editCompositionType: 'Edit composition type',
    comparePerson: 'Compare and merge person authority',
    compareCorporation: 'Compare and merge organisation authority',
    compareSubject: 'Compare and merge subject authority',
    comparePlace: 'Compare and merge place authority',
    compareSerial: 'Compare and merge series',
    compareWorkSeries: 'Compare and merge work series',
    compareInstrument: 'Compare and merge instrument authority',
    compareCompositionType: 'Compare and merge compisiton type',
    compareWork: 'Compare and merge work',

    // menu
    menuHeading: 'Cataloguing and maintenance of the bibliographic collection',
    newMaterial: 'New material',
    authorityMaintenance: 'Authority maintenance',

    // external data
    hitsFromExternalSource: 'Hits in external source - {{../../preferredSource.name}}',
    additionalSuggestionsLegend: `
        <p>Click <b>{{useSuggestion}}</b> to fill in {{allowPartialSuggestions ? numberOfSuggestionsForGroup : numberOfSuggestionsForGroup - numberOfInCompleteForGroup}}
        value{{#if (allowPartialSuggestions ? numberOfSuggestionsForGroup : numberOfSuggestionsForGroup - numberOfInCompleteForGroup) > 1}}s{{/if}}.</p>
        `,
    externalSuggestionsAlreadyUsed: 'Suggestions from main external source have already been used',
    useValuesFromThis: 'Use values from this source',
    thisPublicationIsAlreadyRegistered: 'This publication is already registered',
    alreadyRegisteredISBNSingular: 'There is already a registered a publication with the same ISBN number. Do you want to open that one, continue registering a new one or cancel?',
    alreadyRegisteredISBNPlural: 'There are already registered {{numberOfResources}} publications with the same ISBN number. Do you want to open one of these, continue registering a new one or cancel?',
    suggestedPrefilledValues: 'Suggestions for pre-filled values',

    // extended editing
    worksAndPubsRelatedToAuthority: 'Work and publication associated with {{applicationData.translations[applicationData.language][rdfType + \'LabelDet\']}}:',
    noHitsInExternalSource: 'No hits in external source',
    searchForDuplicates: 'Search for duplicates',
    noRelations: 'No relations',
    cannotMergeWithSelf: 'You can\'t merge with the same {{applicationData.translations[applicationData.language][rdfType + \'Label\']}} you are currently editing.',
    mergeAuthoritiesLegend: `If you chose to merge these to {{applicationData.translations[applicationData.language][rdfType + 'LabelPlur']}} into one, 
                    all the relations that are associated with the {{applicationData.translations[applicationData.language][rdfType + 'Label']}} to the <b>right</b> 
                    are moved to the {{applicationData.translations[applicationData.language][rdfType + 'Label']}} on the <b>left</b>. The information in the fields
                    to the <b>left</b> remains, whereas the information to the right is deleted. Therefore, please make certain that all relevant information is transferred
                    from the {{applicationData.translations[applicationData.language][rdfType + 'Label']}} on the <b>right</b> side to the one on the <b>left</b> side 
                    <b>before</b> merging the two {{applicationData.translations[applicationData.language][rdfType + 'LabelPlur']}}.
`,//
    mergeAuthButtonLabel: 'Merge these two {{applicationData.translations[applicationData.language][rdfType + \'LabelPlur\']}}',

    // split work
    showPublicationsAndSplitWork: 'Show publications/split work',
    splitTheWork: 'Split the work',
    splitWork: 'Split work',
    makeWorkCopyForEachPubliation: 'Make a copy of the work - one for each publication  - and attach the publications to the new works',
    workHasNoPublications: 'This work has no publications.',
    workHasNumberOfPublications: 'This work has {{numberOfRelations}} publication{{numberOfRelations > 1 ? \'s\' : \'\'}}:',
    splitWorkLegend: `If you choose to split this work, a copy of it is created for each publication selected above.
                  Each publication is then attached to its new work as publication of it. Before the work is splitted, you will be asked
                  to select which values from the publications should be copied to corresponding fields of the new works`,
    splitWorkDialogLegend: 'Select which values should be copied from existing publications to the new works that will be created:',

    // links
    showWorkPageLink: 'Work page',
    showTURTLEForWorkLink: 'Work as TURTLE linked data',
    showPublicationInKohaLink: 'Publication in Koha',
    showSummaryLink: 'Catalogue data for this publication',

    // status messages
    statusOpenedExistingResource: 'opened resource',
    statusWorking: 'working...',
    statusSaved: 'saved'
  }
}));
