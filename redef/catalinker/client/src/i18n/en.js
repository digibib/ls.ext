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
    showHideRelations: 'Show/hide relations',
    selectWorkLabel: 'Catalogue publication of this work',
    autoNumber: 'Automatic numbering',
    searchWorkLegend: 'Search by title, main entry, work uri or work id',
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
    suggestionFromOtherSources: 'Suggestions from external sources',
    missingRequiredValuesOfBlankMode: 'Cannot add until {{subjectTypeLabelDet(subjectType)}} has been created or loaded. Mandatory fields must populated.',
    cannotSelectRelationBeforeResourceTypeIsLoaded: 'Cannot select relation until relevant resource type is loaded', //Denne knytningen kan ikke velges før tilhørende ressurstype er lastet
    nameLabel: 'Name', // Navn
    mainEntryLabel: 'Main entry', // Hovedinnførsel
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
    workSeriesWorkLabel: 'Work',
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
    workRelationLabel: 'Relation to other work',

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

    // links
    showWorkPageLink: 'Work page',
    showTURTLEForWorkLink: 'Work as TURTLE (linked data)',
    showPublicationInKohaLink: 'Publication in Koha',
    showSummaryLink: 'Catalogue data for this publication',

    // status messages
    statusOpenedExistingResource: 'opened resource',
    statusWorking: 'working...',
    statusSaved: 'saved',

    // misc
    partsLabel: 'Parts'
  }
}));
