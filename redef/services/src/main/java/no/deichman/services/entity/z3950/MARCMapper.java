package no.deichman.services.entity.z3950;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.marc4j.MarcReader;
import org.marc4j.MarcXmlReader;
import org.marc4j.marc.ControlField;
import org.marc4j.marc.DataField;
import org.marc4j.marc.Subfield;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Stream;

import static com.google.common.base.Splitter.fixedLength;
import static com.google.common.collect.ImmutableMap.of;
import static com.google.common.collect.Lists.newArrayList;
import static java.lang.String.format;
import static java.util.Arrays.stream;
import static java.util.stream.Collectors.toList;
import static java.util.stream.StreamSupport.stream;

/**
 * Responsibility: Map MARC21 to JSON representation.
 */
@SuppressWarnings("checkstyle:MethodLength")
public class MARCMapper {
    private static final int TWENTY_TWO = 22;
    private static final int THIRTY_THREE = 33;
    private static final String SUBJECT_TYPE = "deichman:Subject";
    private static final String GENRE_TYPE = "deichman:Genre";
    private static final String PLACE_TYPE = "deichman:Place";
    private static final String SERIAL_ISSUE_TYPE = "deichman:SerialIssue";
    private static final String CORPORATION_TYPE = "deichman:Corporation";
    private static final String TOP_BANANA_TYPE = "deichman:TopBanana";
    private static final String NATIONALITY_TYPE = "duo:Nationality";
    private static final int THIRTY_FOUR = 34;
    private static final int THIRTY_FIVE = 35;
    private static final int THIRTY_SEVEN = 37;
    private static final Predicate<String> EMPTY_VALUES = s -> s != null;
    private static final int THREE = 3;
    private static final Function<String, String> MUL_FILTER = s -> s.replace("mul", "");
    private boolean simpleIdGenerator = false;
    private int simpleIdGeneratorCounter = 0;

    public MARCMapper() {
    }

    public MARCMapper(boolean simpleIdGenerator) {
        this.simpleIdGenerator = simpleIdGenerator;
    }

    final List<Object> getMapping(String record) {
        MarcReader reader = new MarcXmlReader(IOUtils.toInputStream(record));
        List<Object> list = new ArrayList<>();
        while (reader.hasNext()) {
            list.add(mapRecordToMap(reader.next()));
        }
        return list;
    }

    private Object mapRecordToMap(org.marc4j.marc.Record r) {
        List<Person> persons = new ArrayList<>();
        List<Corporation> corporations = new ArrayList<>();
        List<Contribution> contributions = new ArrayList<>();
        List<PublicationPart> publicationParts = new ArrayList<>();
        List<Work> publicationPartWorks = new ArrayList<>();

        Work work = new Work();
        work.addType(TOP_BANANA_TYPE);

        String workId = newBlankNodeId();
        work.setId(workId);

        Publication publication = new Publication();
        publication.setPublicationOf(work);
        publication.setId(newBlankNodeId());

        List<Object> graphList = new ArrayList<>();
        graphList.add(work);
        graphList.add(publication);

        for (ControlField controlField : r.getControlFields()) {
            switch (controlField.getTag()) {
                case "008":
                    setUriObject(controlField, TWENTY_TWO, "audience", work::setAudience, Audience::translate008pos22);
                    setUriObject(controlField, THIRTY_THREE, "fictionNonfiction", work::setFictionNonfiction, FictionNonfiction::translate);
                    setUriObject(controlField, THIRTY_FOUR, "biography", work::setBiography, Biography::translate);
                    setUriObject(controlField, THIRTY_FIVE, THIRTY_SEVEN, publication::addLanguage, MUL_FILTER, this::languagePrefix);
                    break;
                default:
            }
        }

        boolean foundWorkLanguage = false;
        for (DataField dataField : r.getDataFields()) {
            String tag = dataField.getTag();
            switch (tag) {
                case "015":
                    setUriObject(dataField, 'b', "cataloguingSource", CataloguingSource::translate, publication::setCataloguingSource);
                    getSubfieldValue(dataField, 'a').ifPresent(publication::setCataloguingSourceIdentifier);
                    break;
                case "019":
                    setUriObject(dataField, 'a', "audience", Audience::translate, work::setAudience);
                    setUriObject(dataField, 'b', "format", Format::translate, publication::setFormat);
                    setUriObject(dataField, 'b', "mediaType", MediaType::translateUnitedMediaType, publication::setUnitedMediaType);
                    setUriObject(dataField, 'b', "mediaType", MediaType::translatePagedMediaType, publication::setPagedMediaType);
                    setUriObjectFixedValueWidth(dataField, 'd', 1, "literaryForm", LiteraryForm::translate, work::addLiteraryForm);
                    setUriObjectFixedValueWidth(dataField, 'e', 2, "contentAdaptation", ContentAdaption::translate, work::addContentAdaption);
                    setUriObjectFixedValueWidth(dataField, 'e', 2, "formatAdaptation", FormatAdaption::translate, publication::addFormatAdaption);
                    getSubfieldValue(dataField, 's').ifPresent(publication::setAgeLimit);
                    break;
                case "020":
                    getSubfieldValue(dataField, 'a').ifPresent(publication::setIsbn);
                    setUriObject(dataField, 'b', "binding", Binding::translate, publication::setBinding);
                    break;
                case "025":
                    getSubfieldValue(dataField, 'a').ifPresent(publication::setEan);
                    break;
                case "024":
                    getSubfieldValue(dataField, 'a').ifPresent(publication::setIsmn);
                    break;
                case "041":
                    setUriObjectFixedValueWidth(dataField, 'a', THREE, publication::addLanguage, this::languagePrefix);
                    setUriObjectFixedValueWidth(dataField, 'b', THREE, publication::addSubTitles, this::languagePrefix);
                    setUriObjectFixedValueWidth(dataField, 'h', THREE, work::addLanguage, this::languagePrefix);
                    if (dataField.getSubfields('h').isEmpty()) {
                        setUriObjectFixedValueWidth(dataField, 'a', THREE, work::addLanguage, this::languagePrefix);
                        r.getControlFields()
                                .stream()
                                .filter(f -> f.getTag().equals("008"))
                                .findFirst()
                                .ifPresent(s -> setUriObject(s, THIRTY_FIVE, THIRTY_SEVEN, work::addLanguage, MUL_FILTER, this::languagePrefix));
                    }
                    foundWorkLanguage = true;
                    break;
                case "082":
                    getSubfieldValue(dataField, 'a').ifPresent(extractClassificationAndSource(work, graphList, dataField));
                    break;
                case "090":
                    getSubfieldValue(dataField, 'b').ifPresent(publication::locationFormat);
                    getSubfieldValue(dataField, 'c').ifPresent(publication::locationClassNumber);
                    getSubfieldValue(dataField, 'd').ifPresent(publication::locationSignature);
                    break;
                case "100":
                    getSubfieldValue(dataField, 'a').ifPresent(personName -> {
                        Person person1 = setPersonDataFromDataField(dataField, new Person(newBlankNodeId(), personName));
                        persons.add(person1);
                        MainEntry mainEntryForPerson = new MainEntry(person1, newBlankNodeId());
                        setRole(dataField, mainEntryForPerson);
                        work.addContributon(mainEntryForPerson);
                        contributions.add(mainEntryForPerson);
                    });
                    break;
                case "110":
                    getSubfieldValue(dataField, 'a').ifPresent(corporationName -> {
                        Corporation corporation1 = setCorporationDataFromDataField(dataField, new Corporation(newBlankNodeId(), corporationName));
                        getSubfieldValue(dataField, 'c').ifPresent(place -> {
                            addExternalObject(graphList, place, PLACE_TYPE, corporation1::setPlace);
                        });
                        corporations.add(corporation1);
                        MainEntry mainEntryForCorporation = new MainEntry(corporation1, newBlankNodeId());
                        setRole(dataField, mainEntryForCorporation);
                        publication.addContributon(mainEntryForCorporation);
                        contributions.add(mainEntryForCorporation);
                    });
                    break;
                case "130":
                    setBibliographicDataFromDataField(dataField, work);
                    work.setMissingMainEntry(true);
                    break;
                case "240":
                    setBibliographicDataFromDataField(dataField, work);
                    break;
                case "245":
                    setBibliographicDataFromDataField(dataField, publication);
                    if (r.getVariableFields("240").isEmpty()) {
                        setBibliographicDataFromDataField(dataField, work);
                    }
                    break;
                case "250":
                    getSubfieldValue(dataField, 'a').ifPresent(publication::setEdition);
                    break;
                case "260":
                    getSubfieldValue(dataField, 'a').ifPresent(place -> {
                        addExternalObject(graphList, place, PLACE_TYPE, publication::setHasPlaceOfPublication);
                    });
                    getSubfieldValue(dataField, 'b').ifPresent(publisher -> {
                        addNamed(graphList, publisher, CORPORATION_TYPE, publication::setPublishedBy);
                    });
                    getSubfieldValue(dataField, 'c').ifPresent(publication::setPublicationYear);
                    break;
                case "300":
                    getSubfieldValue(dataField, 'a').ifPresent(publication::setExtent);
                    getSubfieldValue(dataField, 'b').ifPresent(b -> {
                        stream(b.split(","))
                                .map(this::unPunctuate)
                                .map(IllustrativeMatter::translate)
                                .filter(EMPTY_VALUES)
                                .map(fragment -> path("illustrativeMatter", fragment))
                                .map(this::dataPrefix)
                                .map(this::asExternalObject)
                                .forEach(publication::setIllustrativeMatter);
                    });
                    break;
                case "440":
                    getSubfieldValue(dataField, 'a').ifPresent(a -> {
                        Serial serial = new Serial(a, newBlankNodeId());
                        getSubfieldValue(dataField, 'x').ifPresent(serial::setIssn);
                        graphList.add(serial);
                        getSubfieldValue(dataField, 'b').ifPresent(publishedBy -> {
                            addNamed(graphList, publishedBy, CORPORATION_TYPE, serial::setPublisher);
                        });
                        Map<String, Object> serialIssue = new HashMap<>();
                        serialIssue.put("@type", newArrayList(SERIAL_ISSUE_TYPE));
                        String serialIssueId = newBlankNodeId();
                        serialIssue.put("@id", serialIssueId);
                        serialIssue.put("deichman:serial", of("@id", serial.getId()));
                        getSubfieldValue(dataField, 'v').ifPresent(v -> {
                            serialIssue.put("deichman:issue", v);
                        });
                        graphList.add(serialIssue);
                        publication.setSerial(of("@id", serialIssueId));
                    });
                    break;
                case "520":
                    if (dataField.getIndicator1() == ' ') {
                        getSubfieldValue(dataField, 'a').ifPresent(work::setHasSummary);
                    }
                    break;
                case "600":
                    getSubfieldValue(dataField, 'a').ifPresent(personName -> {
                        Person person1 = (Person) extractNewNamed(persons, corporations, dataField, personName);
                        if (getSubfieldValue(dataField, 't').isPresent()) {
                            getSubfieldValue(dataField, 't').ifPresent(title -> {
                                Work workAsSubject = new Work(newBlankNodeId(), title);
                                Contribution contribution = new Contribution(person1, newBlankNodeId());
                                setDefaultRole(contribution);
                                workAsSubject.addContributon(contribution);
                                contributions.add(contribution);
                                graphList.add(workAsSubject);
                                work.addSubject(workAsSubject);
                            });
                        } else {
                            work.addSubject(person1);
                        }
                        getSubfieldValue(dataField, '1').ifPresent(extractClassification(work, graphList, dataField));
                        extractGeographicSubject(work, graphList, dataField);
                    });
                    break;
                case "610":
                    getSubfieldValue(dataField, 'a').ifPresent(a -> {
                        String corporationId = newBlankNodeId();
                        Corporation corporation1 = new Corporation(corporationId, a);
                        setCorporationDataFromDataField(dataField, corporation1);
                        graphList.add(corporation1);
                        getSubfieldValue(dataField, 'c').ifPresent(place -> {
                            addExternalObject(graphList, place, PLACE_TYPE, corporation1::setPlace);
                        });
                        work.addSubject(corporation1);
                        getSubfieldValue(dataField, '1').ifPresent(extractClassification(work, graphList, dataField));
                    });
                    extractGeographicSubject(work, graphList, dataField);
                    break;
                case "611":
                    getSubfieldValue(dataField, 'a').ifPresent(prefLabel -> {
                        String eventId = newBlankNodeId();
                        Event event = new Event(eventId, prefLabel);
                        getSubfieldValue(dataField, 'c').ifPresent(place -> {
                            addExternalObject(graphList, place, PLACE_TYPE, event::setPlace);
                        });
                        getSubfieldValue(dataField, 'd').ifPresent(event::setDate);
                        getSubfieldValue(dataField, 'n').ifPresent(event::setNumber);
                        getSubfieldValue(dataField, 'q').ifPresent(event::setSpecification);
                        graphList.add(event);
                        work.addSubject(event);
                        getSubfieldValue(dataField, '1').ifPresent(extractClassification(work, graphList, dataField));
                    });
                    extractGeographicSubject(work, graphList, dataField);
                    break;
                case "630":
                    String workAsSubjectId = newBlankNodeId();
                    Work work1 = new Work(workAsSubjectId);
                    setBibliographicDataFromDataField(dataField, work1);
                    work.addSubject(work1);
                    graphList.add(work1);
                    extractGeographicSubject(work, graphList, dataField);
                    getSubfieldValue(dataField, '1').ifPresent(extractClassification(work, graphList, dataField));
                    break;
                case "650":
                    mapPrimaryAndSubDivisionSubject(work, graphList, dataField, SUBJECT_TYPE);
                    getSubfieldValue(dataField, '1').ifPresent(extractClassification(work, graphList, dataField));
                    break;
                case "651":
                    mapPrimaryAndSubDivisionSubject(work, graphList, dataField, PLACE_TYPE);
                    getSubfieldValue(dataField, '1').ifPresent(extractClassification(work, graphList, dataField));
                    break;
                case "653":
                    getSubfieldValue(dataField, 'a').ifPresent(a -> {
                        addExternalObject(graphList, a, SUBJECT_TYPE, work::addSubject);
                    });
                    break;
                case "655":
                    getSubfieldValue(dataField, 'a').ifPresent(a -> {
                        addExternalObject(graphList, a, GENRE_TYPE, work::addGenre);
                    });
                    getSubfieldValue(dataField, 'z').ifPresent(z -> {
                        addLabeledValue(graphList, "no", z, NATIONALITY_TYPE, work::addNationality);
                    });
                    break;
                case "700":
                case "710":
                    if (thisIsContribution(dataField)) { // contribution
                        getSubfieldValue(dataField, 'a').ifPresent(contributorName -> {
                            Named named = extractNewNamed(persons, corporations, dataField, contributorName);
                            Contribution contribution = new Contribution(named, newBlankNodeId());
                            setRole(dataField, contribution);
                            publication.addContributon(contribution);
                            contributions.add(contribution);
                        });
                    } else {
                        if (hasPublicationPartRelationship(dataField)) {
                            getSubfieldValue(dataField, 'a').ifPresent(contributorName -> {
                                Named named = extractNewNamed(persons, corporations, dataField, contributorName);
                                PublicationPart publicationPart = new PublicationPart(named, newBlankNodeId());
                                getSubfieldValue(dataField, 't').ifPresent(publicationPart::setMainTitle);
                                setRole(dataField, publicationPart);
                                publicationPart.setAgent(named);
                                publication.addPublicationPart(publicationPart);
                                publicationParts.add(publicationPart);
                            });
                        } else if (hasrelatedWorkRelationship(dataField)) {
                            getSubfieldValue(dataField, 'a').ifPresent(name -> {
                                Named named = extractNewNamed(persons, corporations, dataField, name);
                                getSubfieldValue(dataField, 't').ifPresent(title -> {
                                    Work work2 = new Work(newBlankNodeId(), title);
                                    graphList.add(work2);
                                    WorkRelation workRelation = new WorkRelation(newBlankNodeId(), work2.getId(), dataPrefix(path("relationType", "relatedWork")));
                                    graphList.add(workRelation);
                                    work.isRelatedTo(workRelation);
                                    Contribution contribution = new Contribution(named, newBlankNodeId());
                                    publication.addContributon(contribution);
                                    contributions.add(contribution);
                                });
                            });
                        }
                    }
                    break;
                case "730":
                    if (hasPublicationPartRelationship(dataField)) {
                        PublicationPart publicationPart = new PublicationPart(newBlankNodeId());
                        getSubfieldValue(dataField, 'a').ifPresent(publicationPart::setMainTitle);
                        publication.addPublicationPart(publicationPart);
                        publicationParts.add(publicationPart);
                    } else {
                        if (getSubfieldValue(dataField, 'a').isPresent()) {
                            Work relatedToWork = new Work(newBlankNodeId());
                            setBibliographicDataFromDataField(dataField, relatedToWork);
                            graphList.add(relatedToWork);
                            WorkRelation workRelation = new WorkRelation(newBlankNodeId(), relatedToWork.getId(),
                                    dataPrefix(path("relationType", "relatedWork")));
                            graphList.add(workRelation);
                            work.isRelatedTo(workRelation);
                        }
                    }
                    break;
                case "740":
                    if (hasPublicationPartRelationship(dataField)) {
                        PublicationPart publicationPart = new PublicationPart(newBlankNodeId());
                        getSubfieldValue(dataField, 'a').ifPresent(publicationPart::setMainTitle);
                        publication.addPublicationPart(publicationPart);
                        publicationParts.add(publicationPart);
                    } else {
                        getSubfieldValue(dataField, 'a').ifPresent(work::addAltTitle);
                    }
                    break;
                case "780":
                case "785":
                    getSubfieldValue(dataField, 't').ifPresent(title -> {
                        Work followingWork = new Work(newBlankNodeId(), title);
                        graphList.add(followingWork);
                        WorkRelation relationToFollowing = new WorkRelation(newBlankNodeId(), followingWork.getId(),
                                dataPrefix(path("relationType", tag.equals("780") ? "continuationOf" : "continuedIn")));
                        graphList.add(relationToFollowing);
                        work.isRelatedTo(relationToFollowing);
                    });
                    break;
                default:
                    //we're not interested in the content so we do nothing -- checkstyle requires default.
                    break;
            }
        }

        if (!foundWorkLanguage) {
            r.getControlFields()
                    .stream()
                    .filter(f -> f.getTag().equals("008"))
                    .findFirst()
                    .ifPresent(s -> setUriObject(s, THIRTY_FIVE, THIRTY_SEVEN, work::addLanguage, MUL_FILTER, this::languagePrefix));
        }

        graphList.addAll(persons);
        graphList.addAll(corporations);

        Map<String, Object> topLevelMap = new HashMap<>();
        topLevelMap.put("@context", new ContextObject().getContext());
        topLevelMap.put("@graph", graphList);
        graphList.addAll(contributions);
        if (publicationParts.size() > 0) {
            graphList.addAll(publicationParts);
        }
        graphList.addAll(publicationPartWorks);

        return topLevelMap;
    }

    private Consumer<String> extractClassification(Work work, List<Object> graphList, DataField dataField) {
        return extractClassification(work, graphList, dataField, false);
    }

    private Consumer<String> extractClassificationAndSource(Work work, List<Object> graphList, DataField dataField) {
        return extractClassification(work, graphList, dataField, true);
    }

    private Consumer<String> extractClassification(Work work, List<Object> graphList, DataField dataField, boolean setSource) {
        return classificationNumber -> {
            Classification classification = new Classification(newBlankNodeId(), classificationNumber);
            if (setSource) {
                setUriObject(dataField, '2', "classificationSource", ClassificationSource::translate, classification::setClassificationSource);
            }
            work.addClassification(classification);
            graphList.add(classification);
        };
    }

    private void extractGeographicSubject(Work work, List<Object> graphList, DataField dataField) {
        getSubfieldValue(dataField, 'x').ifPresent(subject -> {
            addExternalObject(graphList, subject, SUBJECT_TYPE, work::addSubject);
        });
        getSubfieldValue(dataField, 'z').ifPresent(place -> {
            addExternalObject(graphList, place, PLACE_TYPE, work::addSubject);
        });
    }

    private boolean thisIsContribution(DataField dataField) {
        return !getSubfieldValue(dataField, 't').isPresent();
    }

    private boolean hasPublicationPartRelationship(DataField dataField) {
        return dataField.getIndicator2() == '2';
    }

    private boolean hasrelatedWorkRelationship(DataField dataField) {
        return dataField.getIndicator2() != '2';
    }

    private Named extractNewNamed(List<Person> persons, List<Corporation> corporations, DataField dataField, String name) {
        String id = newBlankNodeId();
        String tag = dataField.getTag();
        Named named = tag.equals("600") || tag.equals("700") ? new Person(id, name) : new Corporation(id, name);
        if (named instanceof Person) {
            setPersonDataFromDataField(dataField, (Person) named);
            persons.add((Person) named);
        } else {
            setCorporationDataFromDataField(dataField, (Corporation) named);
            corporations.add((Corporation) named);
        }
        return named;
    }

    private String newBlankNodeId() {
        return asBlankNodeId(simpleIdGenerator ? "b" + simpleIdGeneratorCounter++ : UUID.randomUUID().toString());
    }

    private void setBibliographicDataFromDataField(DataField dataField, BibliographicObjectExternal bibliographicObjectExternal) {
        getSubfieldValue(dataField, 'a')
                .ifPresent(getSubfieldValue(dataField, '9')
                        .isPresent() ? bibliographicObjectExternal::setUntranscribedTitle : bibliographicObjectExternal::setMainTitle);
        getSubfieldValue(dataField, 'b').ifPresent(bibliographicObjectExternal::setSubtitle);
        getSubfieldValue(dataField, 'f').ifPresent(bibliographicObjectExternal::setPublicationYear);
        getSubfieldValue(dataField, 'n').ifPresent(bibliographicObjectExternal::setPartNumber);
        getSubfieldValue(dataField, 'p').ifPresent(bibliographicObjectExternal::setPartTitle);
    }

    private void mapPrimaryAndSubDivisionSubject(
            Work work,
            Collection<Object> graphList,
            DataField dataField,
            String primarySubjectType) {
        getSubfieldValue(dataField, 'a').ifPresent(a -> {
            ExternalDataObject subject = addExternalObject(graphList, a, primarySubjectType, work::addSubject);
            getSubfieldValue(dataField, 'q').ifPresent(subject::setSpecification);
        });
        getSubfieldMultiValue(dataField, 'x').forEach(value -> {
            addExternalObject(graphList, value, SUBJECT_TYPE, work::addSubject);
        });
        getSubfieldMultiValue(dataField, 'z').forEach(value -> {
            addExternalObject(graphList, value, PLACE_TYPE, work::addSubject);
        });
    }

    private ExternalDataObject addExternalObject(Collection<Object> graphList, String prefLabel, String type, Consumer<ExternalDataObject> addObjectFunction) {
        String objectId = newBlankNodeId();
        ExternalDataObject externalDataObject = asExternalObject(objectId, type);
        externalDataObject.setPrefLabel(prefLabel);
        addObjectFunction.accept(externalDataObject);
        graphList.add(externalDataObject);
        return externalDataObject;
    }

    private Named addNamed(Collection<Object> graphList, String name, String type, Consumer<ExternalDataObject> addObjectFunction) {
        String objectId = newBlankNodeId();
        Named named = new Named(name, objectId);
        named.setType(type);
        addObjectFunction.accept(named);
        graphList.add(named);
        return named;
    }

    private LabeledValue addLabeledValue(Collection<Object> graphList, String language, String label, String type, Consumer<LabeledValue> addObjectFunction) {
        String objectId = newBlankNodeId();
        LabeledValue labeledValue = new LabeledValue(objectId, type, language, label);
        addObjectFunction.accept(labeledValue);
        graphList.add(labeledValue);
        return labeledValue;
    }

    private Titled addMainTitled(Collection<Object> graphList, String mainTitle, String type, Consumer<ExternalDataObject> addObjectFunction) {
        String objectId = newBlankNodeId();
        Titled mainTitled = new Titled(mainTitle, objectId);
        mainTitled.setType(type);
        addObjectFunction.accept(mainTitled);
        graphList.add(mainTitled);
        return mainTitled;
    }

    private ExternalDataObject asExternalObject(String subjectId, String type) {
        ExternalDataObject externalDataObject = asExternalObject(subjectId);
        externalDataObject.setType(type);
        return externalDataObject;
    }

    private void setRole(DataField dataField, Contribution contribution) {
        getSubfieldValue(dataField, 'e', "forf")
                .map(String::toLowerCase)
                .map(this::unPunctuate)
                .map(Role::translate)
                .map(fragment -> path("role", fragment))
                .map(this::dataPrefix)
                .map(this::asExternalObject)
                .ifPresent(contribution::setRole);
    }

    private void setDefaultRole(Contribution contribution) {
        Optional.of("author")
                .map(fragment -> path("role", fragment))
                .map(this::dataPrefix)
                .map(this::asExternalObject)
                .ifPresent(contribution::setRole);
    }

    private void setUriObject(DataField dataField, char subField, String path, Function<String, String> mapper, Consumer<ExternalDataObject> setterFunction) {
        getSubfieldValues(dataField, subField)
                .map(String::toLowerCase)
                .map(this::unPunctuate)
                .map(mapper)
                .filter(StringUtils::isNotBlank)
                .map(fragment -> path(path, fragment))
                .map(this::dataPrefix)
                .map(this::asExternalObject)
                .forEach(setterFunction);
    }

    private void setUriObjectFixedValueWidth(DataField dataField, char subField, int valueWidth,
                                             String path, Function<String, String> mapper, Consumer<ExternalDataObject> setterFunction) {
        getFixedWidthSubfieldValues(dataField, subField, valueWidth)
                .map(String::toLowerCase)
                .map(mapper)
                .filter(StringUtils::isNotBlank)
                .map(fragment -> path(path, fragment))
                .map(s -> dataPrefix(s))
                .map(this::asExternalObject)
                .forEach(setterFunction);
    }

    private void setUriObjectFixedValueWidth(DataField dataField, char subField, int valueWidth,
                                             Consumer<ExternalDataObject> setterFunction, Function<String, String> mapper) {
        getFixedWidthSubfieldValues(dataField, subField, valueWidth)
                .map(String::toLowerCase)
                .map(mapper)
                .filter(StringUtils::isNotBlank)
                .map(this::asExternalObject)
                .forEach(setterFunction);
    }

    private void setUriObject(ControlField controlField, int position, String path, Consumer<ExternalDataObject> setterFunction, Function<String, String> mapper) {
        getControlFieldValue(controlField, position)
                .map(String::toLowerCase)
                .filter(StringUtils::isNotBlank)
                .map(mapper)
                .map(fragment -> path(path, fragment))
                .map(this::dataPrefix)
                .map(this::asExternalObject)
                .ifPresent(setterFunction);
    }

    private void setUriObject(ControlField controlField, int startPosition, int endPosition,
                              Consumer<ExternalDataObject> setterFunction, Function<String, String> mapper,
                              Function<String, String> prefix) {
        getControlFieldValue(controlField, startPosition, endPosition)
                .map(String::toLowerCase)
                .filter(StringUtils::isNotBlank)
                .map(mapper)
                .filter(StringUtils::isNotBlank)
                .map(prefix)
                .map(this::asExternalObject)
                .ifPresent(setterFunction);
    }

    private Person setPersonDataFromDataField(DataField dataField, Person person) {
        getSubfieldValue(dataField, 'b').ifPresent(person::setOrdinal);
        getSubfieldValue(dataField, 'c').ifPresent(person::setSpecification);
        getSubfieldValue(dataField, 'd').ifPresent(person::setDates);
        getSubfieldValues(dataField, 'j', "-")
                .map(this::unPunctuate)
                .map(fragment -> path("nationality", fragment))
                .map(this::dataPrefix)
                .map(this::asExternalObject)
                .forEach(person::addNationality);
        getSubfieldValue(dataField, 'q').ifPresent(person::setAlternativeName);
        return person;
    }

    private Corporation setCorporationDataFromDataField(DataField dataField, Corporation corporation) {
        getSubfieldValue(dataField, 'b').ifPresent(corporation::setSubdivision);
        getSubfieldValue(dataField, 'q').ifPresent(corporation::setSpecification);
        return corporation;
    }

    private ExternalDataObject asExternalObject(String id) {
        ExternalDataObject externalDataObject = new ExternalDataObject();
        externalDataObject.setId(id);
        return externalDataObject;
    }

    private String unPunctuate(String punctuated) {
        return punctuated.replace(".", "");
    }

    public final String dataPrefix(String unprefixed) {
        return "http://data.deichman.no/" + unprefixed;
    }

    private String languagePrefix(String unprefixed) {
        return "http://lexvo.org/id/iso639-3/" + unprefixed;
    }

    private String path(String path, String fragment) {
        return path + "#" + fragment;
    }

    private Iterable<String> getSubfieldMultiValue(DataField dataField, Character character) {
        return dataField.getSubfields(character).stream().map(Subfield::getData).collect(toList());
    }


    private Optional<String> getSubfieldValue(DataField dataField, Character character) {
        return getSubfieldValue(dataField, character, null);
    }

    private Optional<String> getControlFieldValue(ControlField controlField, int position) {
        return Optional.of("" + format("%1$-39s", controlField.getData()).charAt(position));
    }

    private Optional<String> getControlFieldValue(ControlField controlField, int startPosition, int endPosition) {
        return Optional.of("" + format("%1$-39s", controlField.getData()).substring(startPosition, endPosition + 1));
    }

    private Optional<String> getSubfieldValue(DataField dataField, Character character, String defaultValue) {
        Optional<String> data = Optional.ofNullable(defaultValue);
        if (dataField.getSubfield(character) != null) {
            data = Optional.of(dataField.getSubfield(character).getData());
        }
        return data;
    }

    private Stream<String> getSubfieldValues(DataField dataField, Character character, String... separators) {
        String separator = separators.length > 0 ? separators[0] : ",";
        return stream(getSubfieldValue(dataField, character).orElse("").split(separator)).filter(StringUtils::isNotBlank);
    }

    private Stream<String> getFixedWidthSubfieldValues(DataField dataField, Character character, int valueWidth) {
        return stream(fixedLength(valueWidth).split(getSubfieldValue(dataField, character).orElse("")).spliterator(), false).filter(StringUtils::isNotBlank);
    }


    private String asBlankNodeId(String id) {
        return "_:" + id;
    }

}
