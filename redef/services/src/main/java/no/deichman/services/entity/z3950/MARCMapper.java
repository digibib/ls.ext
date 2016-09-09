package no.deichman.services.entity.z3950;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.marc4j.MarcReader;
import org.marc4j.MarcXmlReader;
import org.marc4j.marc.ControlField;
import org.marc4j.marc.DataField;

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
import static java.lang.String.format;
import static java.util.Arrays.stream;
import static java.util.stream.StreamSupport.stream;

/**
 * Responsibility: Map MARC21 to JSON representation.
 */
@SuppressWarnings("checkstyle:MethodLength")
public class MARCMapper {
    public static final int TWENTY_TWO = 22;
    public static final int THIRTY_THREE = 33;
    public static final String SUBJECT_TYPE = "deichman:Subject";
    public static final String GENRE_TYPE = "deichman:Genre";
    public static final String PERSON_TYPE = "deichman:Person";
    public static final String PLACE_TYPE = "deichman:Place";
    private static final String CORPORATION_TYPE = "deichman:Corporation";
    public static final int THIRTY_FOUR = 34;
    public static final int THIRTY_FIVE = 35;
    public static final int THIRTY_SEVEN = 37;
    public static final Predicate<String> EMPTY_VALUES = s -> s != null;
    private boolean simpleIdGenerator = false;
    private int simpleIdGeneratorCounter = 0;
    public static final Function<String, String> NOP = s -> s;

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
        work.addType("deichman:TopBanana");

        String workId = newBlankNodeId();
        work.setId(workId);

        Publication publication = new Publication();
        publication.setPublicationOf(work);

        List<Object> graphList = new ArrayList<>();
        graphList.add(work);
        graphList.add(publication);

        for (ControlField controlField : r.getControlFields()) {
            switch (controlField.getTag()) {
                case "008":
                    setUriObject(controlField, TWENTY_TWO, "audience", work::setAudience, Audience::translate008pos22);
                    setUriObject(controlField, THIRTY_THREE, "literaryForm", work::addLiteraryForm, LiteraryForm::translate);
                    setUriObject(controlField, THIRTY_FOUR, "biography", work::setBiography, Biography::translate);
                    setUriObject(controlField, THIRTY_FIVE, THIRTY_SEVEN, "language", publication::addLanguage, NOP, this::languagePrefix);
                    break;
                default:
            }
        }

        for (DataField dataField : r.getDataFields()) {
            String tag = dataField.getTag();
            switch (tag) {
                case "019":
                    setUriObject(dataField, 'a', "audience", work::setAudience, Audience::translate);
                    setUriObject(dataField, 'b', "format", publication::setFormat, Format::translate);
                    setUriObject(dataField, 'b', "mediaType", publication::setMediaType, MediaType::translate);
                    setUriObjectFixedValueWidth(dataField, 'd', 1, "literaryForm", work::addLiteraryForm, LiteraryForm::translate);
                    setUriObjectFixedValueWidth(dataField, 'e', 2, "contentAdaption", work::addContentAdaption, ContentAdaption::translate);
                    setUriObjectFixedValueWidth(dataField, 'e', 2, "formatAdaption", publication::addFormatAdaption, FormatAdaption::translate);
                    getSubfieldValue(dataField, 's').ifPresent(publication::setAgeLimit);
                    break;
                case "020":
                    getSubfieldValue(dataField, 'a').ifPresent(publication::setIsbn);
                    getSubfieldValue(dataField, 'n').ifPresent(publication::setBinding);
                    break;
                case "100":
                    getSubfieldValue(dataField, 'a').ifPresent(personName -> {
                        Person person1 = setPersonDataFromDataField(dataField, new Person(newBlankNodeId(), personName));
                        persons.add(person1);
                        MainEntry mainEntryForPerson = new MainEntry(person1, newBlankNodeId());
                        setRole(dataField, mainEntryForPerson);
                        publication.addContributon(mainEntryForPerson);
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
                        addExternalObject(graphList, place, PLACE_TYPE, publication::setPlaceOfPublication);
                    });
                    getSubfieldValue(dataField, 'b').ifPresent(publisher -> {
                        addNamed(graphList, publisher, CORPORATION_TYPE, publication::setPublisher);
                    });
                    getSubfieldValue(dataField, 'c').ifPresent(publication::setPublicationYear);
                    break;
                case "300":
                    getSubfieldValue(dataField, 'a').ifPresent(publication::setNumberOfPages);
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
                        graphList.add(serial);
                        getSubfieldValue(dataField, 'b').ifPresent(publishedBy -> {
                            addNamed(graphList, publishedBy, CORPORATION_TYPE, serial::setPublisher);
                        });
                        Map<String, Object> serialIssue = new HashMap<>();
                        serialIssue.put("@type", "deichman:SerialIssue");
                        serialIssue.put("serial", of("@id", serial.getId()));
                        getSubfieldValue(dataField, 'v').ifPresent(v -> {
                            serialIssue.put("issue", v);
                        });
                        publication.setSerial(serialIssue);
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
                        getSubfieldValue(dataField, 'x').ifPresent(subject -> {
                            addExternalObject(graphList, subject, SUBJECT_TYPE, work::addSubject);
                        });
                        getSubfieldValue(dataField, 'z').ifPresent(place -> {
                            addExternalObject(graphList, place, PLACE_TYPE, work::addSubject);
                        });
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
                    });
                    getSubfieldValue(dataField, 'x').ifPresent(subject -> {
                        addExternalObject(graphList, subject, SUBJECT_TYPE, work::addSubject);
                    });
                    getSubfieldValue(dataField, 'z').ifPresent(place -> {
                        addExternalObject(graphList, place, PLACE_TYPE, work::addSubject);
                    });
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
                    });
                    getSubfieldValue(dataField, 'x').ifPresent(subject -> {
                        addExternalObject(graphList, subject, SUBJECT_TYPE, work::addSubject);
                    });
                    getSubfieldValue(dataField, 'z').ifPresent(place -> {
                        addExternalObject(graphList, place, PLACE_TYPE, work::addSubject);
                    });
                    break;
                case "630":
                    String workAsSubjectId = newBlankNodeId();
                    Work work1 = new Work(workAsSubjectId);
                    setBibliographicDataFromDataField(dataField, work1);
                    work.addSubject(work1);
                    graphList.add(work1);
                    getSubfieldValue(dataField, 'x').ifPresent(subject -> {
                        addExternalObject(graphList, subject, SUBJECT_TYPE, work::addSubject);
                    });
                    getSubfieldValue(dataField, 'z').ifPresent(place -> {
                        addExternalObject(graphList, place, PLACE_TYPE, work::addSubject);
                    });
                    break;
                case "650":
                    mapPrimaryAndSubDivisionSubject(work, graphList, dataField, SUBJECT_TYPE, PLACE_TYPE, 'z');
                    break;
                case "651":
                    mapPrimaryAndSubDivisionSubject(work, graphList, dataField, PLACE_TYPE, SUBJECT_TYPE, 'x');
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
                        } else if (hasBasedOnRelationship(dataField)) {
                            getSubfieldValue(dataField, 'a').ifPresent(name -> {
                                Named named = extractNewNamed(persons, corporations, dataField, name);
                                getSubfieldValue(dataField, 't').ifPresent(title -> {
                                    Work work2 = new Work(newBlankNodeId(), title);
                                    graphList.add(work2);
                                    WorkRelation workRelation = new WorkRelation(newBlankNodeId(), work2.getId(), dataPrefix(path("relationType", "basedOn")));
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
                            Work basedOnWork = new Work(newBlankNodeId());
                            setBibliographicDataFromDataField(dataField, basedOnWork);
                            graphList.add(basedOnWork);
                            WorkRelation workRelation = new WorkRelation(newBlankNodeId(), basedOnWork.getId(),
                                    dataPrefix(path("relationType", "basedOn")));
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
                                dataPrefix(path("relationType", tag.equals("780") ? "continuedIn" : "continuationOf")));
                        graphList.add(relationToFollowing);
                        work.isRelatedTo(relationToFollowing);
                    });
                    break;
                default:
                    //we're not interested in the content so we do nothing -- checkstyle requires default.
                    break;
            }
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

    private boolean thisIsContribution(DataField dataField) {
        return !getSubfieldValue(dataField, 't').isPresent();
    }

    private boolean hasPublicationPartRelationship(DataField dataField) {
        return dataField.getIndicator2() == '2';
    }

    private boolean hasBasedOnRelationship(DataField dataField) {
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
        getSubfieldValue(dataField, 'a').ifPresent(bibliographicObjectExternal::setMainTitle);
        getSubfieldValue(dataField, 'b').ifPresent(bibliographicObjectExternal::setSubtitle);
        getSubfieldValue(dataField, 'f').ifPresent(bibliographicObjectExternal::setPublicationYear);
        getSubfieldValue(dataField, 'n').ifPresent(bibliographicObjectExternal::setPartNumber);
        getSubfieldValue(dataField, 'p').ifPresent(bibliographicObjectExternal::setPartTitle);
    }

    private void mapPrimaryAndSubDivisionSubject(
            Work work,
            Collection<Object> graphList,
            DataField dataField,
            String primarySubjectType,
            String subDivisionSubjectType,
            char subDivisionField) {
        getSubfieldValue(dataField, 'a').ifPresent(a -> {
            ExternalDataObject subject = addExternalObject(graphList, a, primarySubjectType, work::addSubject);
            getSubfieldValue(dataField, 'q').ifPresent(subject::setSpecification);
        });
        getSubfieldValue(dataField, subDivisionField).ifPresent(a -> {
            addExternalObject(graphList, a, subDivisionSubjectType, work::addSubject);
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

    private Named addNamed(Collection<Object> graphList, String name, String type, Consumer<String> addObjectFunction) {
        String objectId = newBlankNodeId();
        Named named = new Named(name, objectId);
        named.setType(type);
        addObjectFunction.accept(named.getId());
        graphList.add(named);
        return named;
    }

    private ExternalDataObject asExternalObject(String subjectId, String type) {
        ExternalDataObject externalDataObject = asExternalObject(subjectId);
        externalDataObject.setType(type);
        return externalDataObject;
    }

    private void setRole(DataField dataField, Contribution contribution) {
        getSubfieldValue(dataField, 'e', "contributor")
                .map(String::toLowerCase)
                .map(this::unPunctuate)
                .map(Role::translate)
                .map(fragment -> path("role", fragment))
                .map(this::dataPrefix)
                .map(this::asExternalObject)
                .ifPresent(contribution::setRole);
    }

    private void setDefaultRole(Contribution contribution) {
        Optional.of("contributor")
                .map(fragment -> path("role", fragment))
                .map(this::dataPrefix)
                .map(this::asExternalObject)
                .ifPresent(contribution::setRole);
    }

    private void setUriObject(DataField dataField, char subField, String path, Consumer<ExternalDataObject> setterFunction, Function<String, String> mapper) {
        getSubfieldValues(dataField, subField)
                .map(String::toLowerCase)
                .map(mapper)
                .filter(StringUtils::isNotBlank)
                .map(fragment -> path(path, fragment))
                .map(this::dataPrefix)
                .map(this::asExternalObject)
                .forEach(setterFunction);
    }

    private void setUriObjectFixedValueWidth(DataField dataField, char subField, int valueWidth,
                                             String path, Consumer<ExternalDataObject> setterFunction, Function<String, String> mapper) {
        getFixedWidthSubfieldValues(dataField, subField, valueWidth)
                .map(String::toLowerCase)
                .map(mapper)
                .filter(StringUtils::isNotBlank)
                .map(fragment -> path(path, fragment))
                .map(this::dataPrefix)
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

    private void setUriObject(ControlField controlField, int startPosition, int endPosition, String path,
                              Consumer<ExternalDataObject> setterFunction, Function<String, String> mapper,
                              Function<String, String> prefix) {
        getControlFieldValue(controlField, startPosition, endPosition)
                .map(String::toLowerCase)
                .filter(StringUtils::isNotBlank)
                .map(mapper)
                .map(prefix)
                .map(this::asExternalObject)
                .ifPresent(setterFunction);
    }

    private Person setPersonDataFromDataField(DataField dataField, Person person) {
        getSubfieldValue(dataField, 'b').ifPresent(person::setOrdinal);
        getSubfieldValue(dataField, 'c').ifPresent(person::setSpecification);
        getSubfieldValue(dataField, 'd').ifPresent(person::setDates);
        getSubfieldValue(dataField, 'j')
                .map(this::unPunctuate)
                .map(fragment -> path("nationality", fragment))
                .map(this::dataPrefix)
                .map(this::asExternalObject)
                .ifPresent(person::setNationality);
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

    private String dataPrefix(String unprefixed) {
        return "http://data.deichman.no/" + unprefixed;
    }

    private String languagePrefix(String unprefixed) {
        return "http://lexvo.org/id/iso639-3/" + unprefixed;
    }

    private String path(String path, String fragment) {
        return path + "#" + fragment;
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
