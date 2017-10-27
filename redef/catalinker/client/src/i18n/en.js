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
    pleaseWait: 'Please wait…',
    close: 'Close',
    cancel: 'Cancel',
    proceed: 'Proceed',
    ignore: 'Ignore',
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
    show: 'show',
    hide: 'hide',
    showEsotericFieldsLegend: 'Click here to reveal more rarely used fields',
    showEsotericFieldsSupportLegend: 'Some fields are hidden because they are rarely used in this context. Click on the link to the left to show them anyway.',
    selectWorkLabel: 'Catalogue publication of this work',
    autoNumber: 'Automatic numbering',
    searchWorkLegend: 'Search by title, main entry, work uri or work id',
    workTitlePlaceHolder: 'Work title/work ID',
    searchPublicationLegend: 'Search by title or record id',
    advancedSearchLegend: 'You are using <span class="more-info" title="Search containg any of these characters: {{advancedSearchCharacters()}}. You can also use AND, OR og NOT.">advanced search</span>. Press Enter to search.',
    useSuggestion: 'Use suggestion',
    deleteEntry: 'Delete entry',
    editEntry: 'Edit entry',
    defaultAddAnotherLabel: 'Add',
    addAnotherPageNumber: 'Add another page number',
    addAnotherExtent: 'Add  another extent',
    addAnotherISBN: 'Add  another ISBN',
    addAnotherISMN: 'Add another ISMN',
    addAnotherEAN: 'Add another EAN',
    addAnotherPublisher: 'Add another publisher',
    addAnotherSeries: 'Add  another series',
    addAnotherRelation: 'Add  another relation',
    addAnotherWorkSeries: 'Add  another work series',
    addAnotherCompositionType: 'Add  another composition type',
    addAnotherInstrument: 'Add  another instrument',
    addAnotherSubject: 'Add  another subject',
    addAnotherClassification: 'Add  another classification',
    addAnotherGenre: 'Add  another genre',
    addAnotherPart: 'Add  another part',
    addAnotherAdditionalEntry: 'Add  another contributor',
    addAnotherVariantTitle: 'Add another variant title',
    addAnotherTag: 'Add another tag',
    addAnotherAlternativeName: 'Add another alternative name',
    suggestionFromOtherSources: 'Suggestions from external sources',
    missingRequiredValuesOfBlankMode: 'Cannot add until {{subjectTypeLabelDet(subjectType)}} has been created or loaded. Mandatory fields must populated.',
    cannotSelectRelationBeforeResourceTypeIsLoaded: 'Cannot select relation until relevant resource type is loaded', //Denne knytningen kan ikke velges før tilhørende ressurstype er lastet
    nameLabel: 'Name', // Navn
    mainEntryLabel: 'Main entry', // Hovedinnførsel
    authorLabel: 'Author',
    ISBNLabel: 'ISBN',
    EANLabel: 'EAN',
    missingMainEntryLabel: 'Work has no main contributor',
    mainContributorLabel: 'Main contributor',
    agentLabel: 'Agent',
    improperWorkLabel: 'Not part of list of works',
    searchWorkAsMainResourceLabel: 'Search for existing work',
    publicationTabLabel: 'Describe publication',
    seriesLabel: 'Series',
    seriesTitleLabel: 'Series title',
    seriesPartNumber: 'Series part number',
    issueNumberLabel: 'Number in series',
    subSeriesTitle: 'Sub-series title',
    workTabLabel: 'Describe work',
    workSeriesWorkLabel: 'Related to',
    relationTypeLabel: 'Relation type',
    publishedByLabel: 'Publisher',
    publicationYearLabel: 'Year',
    originCountryLabel: 'Country of origin',
    subjectsTabLabel: 'Subjects',
    instrumentationLabel: 'Intrumentation',
    selectSubjectType: 'Select subject type',
    selectActorType: 'Select agent type',
    numberOfPerformersLabel: 'Number of performers',
    classificationLabel: 'Classification',
    classificationSourceLabel: 'Classification source',
    publicationPartsTabLabel: 'Describe parts',
    publicationPartsLabel: 'Parts',
    pubPartMainTitleLabel: 'Part title',
    bulkEntryLinkLabel: 'Add multiple titles',
    bulkEntryLinkToolTip: 'Add multiple parts in one operation',
    enableBulkEntryLegend: `Enter each part-title on a new line. Clicking "Add", creates one publication part
                            for each title (empty lines are ignored). Every part is also associated with same agent
                            and role if provided above. If you do not want auto-numbering of parts, uncheck below 
                            `,
    additionalEntriesTabLabel: 'Additional entries',
    additionalEntryLabel: 'Additional entry',
    workRelationLabel: 'Relation to other work or work series',

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

    // type explanations
    personExplanation: '(Person)',
    generalSubjectExplanation: '(General subject)',
    workExplanation: '(Work)',
    genreExplanation: '(Genre)',
    corporationExplanation: '(Corporation)',
    placeExplanation: '(Place)',
    eventExplanation: '(Event)',
    serialExplanation: '(Serial)',
    publicationExplanation: '(Publication)',
    instrumentExplanation: '(Instrument)',
    workSeriesExplanation: '(Series)',
    compositionTypeExplanation: '(Composition type)',

    // determinative
    PersonLabelDet: 'the person',
    GeneralSubjectLabelDet: 'the subject',
    WorkLabelDet: 'the work',
    GenreLabelDet: 'the genre',
    CorporationLabelDet: 'the corporation',
    PlaceLabelDet: 'the place',
    EventLabelDet: 'the event',
    SerialLabelDet: 'the serial',
    PublicationLabelDet: 'the publication',
    InstrumentLabelDet: 'the instrument',
    WorkSeriesLabelDet: 'the work series',
    CompositionTypeLabelDet: 'the composition type',

    // demonstrative
    PersonLabelDem: 'this person',
    GeneralSubjectLabelDem: 'this subject',
    WorkLabelDem: 'this work',
    GenreLabelDem: 'this genre',
    CorporationLabelDem: 'this corporation',
    PlaceLabelDem: 'this place',
    EventLabelDem: 'this event',
    SerialLabelDem: 'this serial',
    PublicationLabelDem: 'this publication',
    InstrumentLabelDem: 'this instrument',
    WorkSeriesLabelDem: 'this work series',
    CompositionTypeLabelDem: 'this composition type',

    // indeterminative
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
    PublicationPartLabel: 'part of publication',

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
    maintCorporationLabelPlur : 'Corporations',
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
    createNewWorkLabel: 'Create new work',
    createNewWorkSeriesLabel: 'Create new work series',
    createNewPlaceLabel: 'Create new place',
    createNewEventLabel: 'Create new event',
    createNewSeriesLabel: 'Create new series',
    createNewInstrumentLabel: 'Create new instruent',
    createNewCompositionTypeLabel: 'Create new composition type',
    createNewPersonLabel: 'Create new person',
    createNewCorporationLabel: 'Create new corporation',
    createNewGenreLabel: 'Create new genre',
    createNewSubjectLabel: 'Create new subject',

    // next step buttons
    nextStepDescription: 'Next step: Description',
    nextStepDescribeWork: 'Next step: Describe work',
    nextStepSubjects: 'Next step: Subjects',
    nextStepDescribeParts: 'Next step: Describe parts',
    nextStepAdditionalEntries: 'Next step: Additonal contributors',
    finishRegisterPublication: 'Finish',

    // other buttons
    deletePublication: 'Delete this publication',
    deleteWork: 'Delete this work',
    changeWorkOfPublication: 'Move publication to another work',
    confirmChangeWorkOfPublication: 'Are you sure you wish to move this publication to another work?',
    extendedEdit: 'Extended editing',

    // dialogs
    // delete publication
    deletePublicationDialogTitle: 'Delete publication',
    confirmDeletePublication: 'Confirm delete publication',
    confirmDeletePublicationDetail: 'Yes, I do want to delete this publication:',
    publicationDeleted: 'The publication {{title}} of the work {{work}} is deleted',
    deletePublicationFailed: 'Could not delete the publication',
    itemsLeftMessage: 'There are {{numberOfItemsLeft}} items registered in Koha.',
    gotoKohaForDeleteLink: `Remove <a data-automation-id="biblio_record_link" target="_blank"
               href="{{config.kohaIntraUri}}/cgi-bin/koha/catalogue/detail.pl?biblionumber={{publicationId()}}"
               class="link">items in Koha</a> before continuing.
    `,

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
    confirmDeleteWorkDetail: 'Yes, I want to delete this work:',
    workDeleted: '{{title}} is deleted',
    workDeleteFailed: 'Could not delete the work',
    workDeleteFailedPublicationsLeft: 'There {{numberOfPublicationsLeft > 1 ? \'are\' : \'is\'}} {{numberOfPublicationsLeft}} publications linked to it.',

    // edit authority
    confirmEditResource: 'Are you sure you wish to edit {{fieldLabel}} of {{rdfType + \'LabelDet\'}}',

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
    compareCompositionType: 'Compare and merge composition type',
    compareWork: 'Compare and merge work',

    // menu
    menuHeading: 'Cataloguing and maintenance of bibliographic collections',
    newMaterial: 'New material',
    authorityMaintenance: 'Authority maintenance',

    // external data
    guessedSearchParameterLegend: 'It looks like you wish to search by <b>{{>parameterGuess}}</b>.<br/>You can use one of these ccl-prefixes if you want: {{cclCodes}}.',
    DFBSearchLabel: 'Search Det flerspråklige bibliotek',
    DFBPlaceHolderISBN: 'ISBN/title/author/local record id',
    DFBPlaceHolderEAN: 'EAN/title/author/local record id',
    BSSearchLabel: 'Search Biblioteksentralen',
    titleLabel: 'Title',
    localIdlabel: 'Local identifier',
    hitsFromExternalSource: '{{items.length}}{{#if items.length !== totalHits}} of {{totalHits}}{{/if}} hits from external source - {{../../preferredSource.name}}',
    invalidEanNumber: 'This doesn\'t look like a valid EAN number',
    invalidIsbnNumber: 'This doesn\'t look like a valid ISBN number',
    alreadyRegisteredEANSingular: 'There is already a registered a publication with the same EAN number. Do you want to open that one, continue registering a new one or cancel?',
    alreadyRegisteredEANPlural: 'There are already registered {{numberOfResources}} publications with the same EAN number. Do you want to open one of these, continue registering a new one or cancel?',
    searchUnavailableBecauseOfAcceptedExternalItem: 'You can\'t perform another search when a suggestion has been accepted',
    additionalSuggestionsLegend: `
        <p>Click <b>{{useSuggestion}}</b> to fill in {{allowPartialSuggestions ? numberOfSuggestionsForGroup : numberOfSuggestionsForGroup - numberOfInCompleteForGroup}}
        value{{#if (allowPartialSuggestions ? numberOfSuggestionsForGroup : numberOfSuggestionsForGroup - numberOfInCompleteForGroup) > 1}}s{{/if}}.</p>
        `,
    externalSuggestionsAlreadyUsed: 'Suggestions from main external source have already been used',
    showHideFromExternalSources: '{{#if expanded}}Hide{{else}}Show{{/if}} suggestions from {{#if !suggestionsAreDemoted}}other {{/if}} external sources',
    useValuesFromThis: 'Use values from this source',
    thisPublicationIsAlreadyRegistered: 'This publication is already registered',
    alreadyRegisteredISBNSingular: 'There is already a registered a publication with the same ISBN number. Do you want to open that one, continue registering a new one or cancel?',
    alreadyRegisteredISBNPlural: 'There are already registered {{numberOfResources}} publications with the same ISBN number. Do you want to open one of these, continue registering a new one or cancel?',
    suggestedPrefilledValues: 'Suggestions for pre-populated values',
    useValuesFromTheseFields: 'Use values from these fields:',
    andFillTheEmptyFields: '...to fill the empty fields for these:',
    unknownPredefinedValuesMessage: `Value from {{unknownPredefinedValues.sourceLabel}}, "{{unknownPredefinedValues.values.join(',')}}",
                is not among the possible values applicable to <b>{{#if labelKey}}{{>labelKey}}{{else}}{{label}}{{/if}}</b >.<br/>
                Please select most suitable value from the dropdown list.
    `,

    // extended editing
    worksAndPubsRelatedToAuthority: 'Works and publications associated with {{applicationData.translations[applicationData.language][rdfType + \'LabelDet\']}}:',
    noHitsInExternalSource: 'No hits in external source',
    searchForDuplicates: 'Search for duplicates',
    noRelations: 'No relations',
    cannotMergeWithSelf: 'You cannot merge with the same {{applicationData.translations[applicationData.language][rdfType + \'Label\']}} you are currently editing.',
    mergeAuthoritiesLegend: `If you chose to merge these to {{applicationData.translations[applicationData.language][rdfType + 'LabelPlur']}} into one, 
                    all the relations that are associated with the {{applicationData.translations[applicationData.language][rdfType + 'Label']}} to the <b>right</b> 
                    are moved to the {{applicationData.translations[applicationData.language][rdfType + 'Label']}} on the <b>left</b>. The information in the fields
                    to the <b>left</b> remain, whereas the information to the right is deleted. Therefore, please make certain that all relevant information is transferred
                    from the {{applicationData.translations[applicationData.language][rdfType + 'Label']}} on the <b>right</b> to the one on the <b>left</b> 
                    <b>before</b> merging the two {{applicationData.translations[applicationData.language][rdfType + 'LabelPlur']}}.
`,//
    mergeAuthButtonLabel: 'Merge these two {{applicationData.translations[applicationData.language][rdfType + \'LabelPlur\']}}',
    mergeResourcesDialogTitle: 'Merge authorities',
    addMoreValuesInExtendedEditing: 'You can add more in extended editing',

    // split work
    showPublicationsAndSplitWork: 'Show publications/split work',
    splitTheWork: 'Split the work',
    splitWork: 'Split work',
    makeWorkCopyForEachPubliation: 'Make a copy of the work - one for each publication - and attach the publications to the new works',
    workHasNoPublications: 'This work has no publications.',
    workHasNumberOfPublications: 'This work has {{numberOfRelations}} publication{{numberOfRelations > 1 ? \'s\' : \'\'}}:',
    splitWorkLegend: `If you choose to split this work, a copy of it is created for each publication selected above.
                  Each publication is then attached to its own new work. Before the work is split, you will be asked
                  to select which values from the publications should be copied to corresponding fields on the new works`,
    splitWorkDialogLegend: 'Select values to be copied from existing publications to the new works that will be created:',

    // copy publication
    copyPublicationButtonLabel: 'Copy publication and work',
    copyPublicationWarningDialogLegend: 'Are yoy sure you want to copy this publication?',
    copyPublicationWarningDialogExplanation: 'This will create a new publication and a new work.',
    copyPublicationDialogTitle: 'Copy publication and work',
    progressCopyingPublication: 'Copying publication...',
    progressCopyingWork: 'Copying work...',
    progressConnectingPubToWork: 'Connecting publication and work...',
    progressCopyingDone: 'Click OK to open the new publication now or Cancel to continue with the original.<p>You can also <a target="_blank" href="/cataloguing?template=workflow&openTab=1&copy=true&Publication={{clonedPublicationUri}}">open the copy in a new tab.</a></p>',
    copyPublicationFailed: 'Something went wrong when copying. Please try again later.',

    // links
    showWorkPageLink: 'Work page',
    showTURTLEForWorkLink: 'Work as TURTLE (linked data)',
    showPublicationInKohaLink: 'Publication in Koha',
    showSummaryLink: 'Catalogue data for this publication',

    // status messages
    statusOpenedExistingResource: 'opened resource',
    statusWorking: 'working...',
    statusSaved: 'saved',

    // labels for inverse relations
    'http://data.deichman.no/ontology#subject_inverse': 'Works with this {{#if subjectType == "Subject"}}subject{{else}}{{>subjectType + "Label"}} as subject{{/if}}',
    'http://data.deichman.no/ontology#publicationOf_inverse': 'Publications of this work',
    'http://data.deichman.no/ontology#hasPublicationPart_inverse': 'Published as part',
    'http://data.deichman.no/ontology#inSerial_inverse': 'Publications in this series',
    'http://data.deichman.no/ontology#isPartOfWorkSeries_inverse': 'Works in this series',
    'http://data.deichman.no/ontology#genre_inverse': 'Works in this genre',
    'http://data.deichman.no/ontology#hasPlaceOfPublication_inverse': 'Published at this place',
    'http://data.deichman.no/ontology#isRelatedTo_inverse': 'Works related to this work',
    'http://data.deichman.no/ontology#hasInstrumentation_inverse': 'Works with this instrument',
    'http://data.deichman.no/ontology#hasCompositionType_inverse': 'Works with this composition type',
    'http://data.deichman.no/relationType#partOf_inverse': 'Works that are parts of this',
    'http://data.deichman.no/relationType#relatedWork_inverse': 'Works related to this',
    'http://data.deichman.no/relationType#continuationOf_inverse': 'Works of which this is a continuation',
    'http://data.deichman.no/relationType#continuedIn_inverse': 'Works that are parts of this',
    inverseRoleRelation: 'Works/publications with {{>subjectType + "LabelDem"}} as {{role.toLowerCase()}}',

    // misc
    partsLabel: 'Parts',
    inputTooLong: 'Please remove {{overChars}} characters',
    inputTooShort: 'Please enter at least {{minimum}} character{{s}}',
    loadingMore: 'Loading results…',
    maximumOneCanBeSelected: 'You can only select one item here',
    maximumSelected: 'You can select at most {{maximum}} values here',
    noResults: 'No results',
    searching: 'Searching…',
    copiedFrom: 'From {{>copiedFromType + "LabelDet"}}',
    copiedFromLegend: 'The value in this fields has been copied from {{copiedFromLabel}} of {{>copiedFromType + "LabelDet"}}',
    acceptedStringFormat: 'Values must not start or end with white space',
    yes: 'Yes',
    no: 'No'
  }
}));
