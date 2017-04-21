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
    autoNumber: 'Automatisk nummerering',
    searchWorkLegend: 'Søk etter tittel, hovedinnførsel, verksuri eller -id',
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
    suggestionFromOtherSources: 'Forslag fra andre eksterne kilder',
    missingRequiredValuesOfBlankMode: 'Kan ikke legge til før {{subjectTypeLabelDet(subjectType)}} er opprettet eller lastet. Påkrevde felter må være utfylt eller ha valgt autoritet/fast verdi.',
    cannotSelectRelationBeforeResourceTypeIsLoaded: 'Denne knytningen kan ikke velges før tilhørende ressurstype er lastet',
    nameLabel: 'Navn',
    mainEntryLabel: 'Hovedinnførsel',
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
    workSeriesWorkLabel: 'Verk',
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
    workRelationLabel: 'Relasjon til annet verk',

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

    // determinativs
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
    hitsFromExternalSource: 'Treff i ekstern kilde - {{../../preferredSource.name}}',
    noHitsInExternalSource: 'Ingen treff i eksterne kilder',
    additionalSuggestionsLegend: `
        <p>Klikk <b>Bruk forslag</b> for å fylle inn {{allowPartialSuggestions ? numberOfSuggestionsForGroup : numberOfSuggestionsForGroup - numberOfInCompleteForGroup}}
        verdi{{#if (allowPartialSuggestions ? numberOfSuggestionsForGroup : numberOfSuggestionsForGroup - numberOfInCompleteForGroup) > 1}}er{{/if}}.</p>
        `,
    externalSuggestionsAlreadyUsed: 'Forslag fra ekstern hovedkilde er allerede hentet inn',
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

    // links
    showWorkPageLink: 'Vis siden for verket',
    showTURTLEForWorkLink: 'Vis lenkede data i TURTLE-format for verket',
    showPublicationInKohaLink: 'Vis utgivelsen i Koha',
    showSummaryLink: 'Vis katalogiserte data for utgivelsen',

    // status messages
    statusOpenedExistingResource: 'åpnet eksisterende ressurs',
    statusWorking: 'arbeider...',
    statusSaved: 'alle endringer er lagret'
  }
}))