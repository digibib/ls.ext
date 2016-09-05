package no.deichman.services.entity.z3950;

import no.deichman.services.entity.EntityType;
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
import java.util.stream.Stream;

import static com.google.common.collect.ImmutableMap.of;
import static java.lang.String.format;
import static java.util.Arrays.stream;

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

    public MARCMapper() {
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

        String workId = UUID.randomUUID().toString();
        work.setId(workId);

        Publication publication = new Publication();
        publication.setPublicationOf(workId);

        List<Object> graphList = new ArrayList<>();
        graphList.add(work);
        graphList.add(publication);

        for (ControlField controlField : r.getControlFields()) {
            switch (controlField.getTag()) {
                case "008":
                    setUriObject(controlField, TWENTY_TWO, "audience", work::setAudience, Audience::translate008pos22);
                    setUriObject(controlField, THIRTY_THREE, "literaryForm", work::setLiteraryForm, LiteraryForm::translate);
                    break;
                default:
            }
        }

        for (DataField dataField : r.getDataFields()) {
            switch (dataField.getTag()) {
                case "019":
                    setUriObject(dataField, 'a', "audience", work::setAudience, Audience::translate);
                    setUriObject(dataField, 'b', "format", publication::setFormat, Format::translate);
                    break;
                case "020":
                    getSubfieldValue(dataField, 'a').ifPresent(publication::setIsbn);
                    getSubfieldValue(dataField, 'n').ifPresent(publication::setBinding);
                    break;
                case "100":
                    final Person[] person = new Person[1];
                    final Contribution[] workContribution = new Contribution[1];
                    getSubfieldValue(dataField, 'a').ifPresent(s -> {
                        Map<String, Object> workContributionMap = composeContribution(s, EntityType.WORK, new Person());
                        work.setContributor(s);
                        work.setContributor((String) workContributionMap.get("contributorLink"));
                        workContribution[0] = (Contribution) workContributionMap.get("contribution");
                        person[0] = (Person) workContributionMap.get("contributor");
                        setPersonDataFromDataField(dataField, person[0]);
                        setRole(dataField, workContribution[0]);
                    });

                    persons.add(person[0]);
                    contributions.add(workContribution[0]);
                    break;
                case "110":
                    final Corporation[] corporation = new Corporation[1];
                    final Contribution[] workContribution1 = new Contribution[1];
                    getSubfieldValue(dataField, 'a').ifPresent(s -> {
                        Map<String, Object> workContributionMap = composeContribution(s, EntityType.WORK, new Corporation());
                        work.setContributor(s);
                        work.setContributor((String) workContributionMap.get("contributorLink"));
                        workContribution1[0] = (Contribution) workContributionMap.get("contribution");
                        corporation[0] = (Corporation) workContributionMap.get("contributor");
                    });
                    setCorporationDataFromDataField(dataField, corporation[0]);
                    setRole(dataField, workContribution1[0]);
                    getSubfieldValue(dataField, 'c').ifPresent(place -> {
                        addExternalObject(graphList, place, PLACE_TYPE, corporation[0]::setPlace);
                    });

                    corporations.add(corporation[0]);
                    contributions.add(workContribution1[0]);
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
                                .map(fragment -> path("illustrativeMatter", fragment))
                                .map(this::dataPrefix)
                                .map(this::asExternalObject)
                                .forEach(publication::setIllustrativeMatter);
                    });
                    break;
                case "440":
                    getSubfieldValue(dataField, 'a').ifPresent(a -> {
                        Serial serial = new Serial(a, asBlankNodeId(UUID.randomUUID().toString()));
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
                    getSubfieldValue(dataField, 'a').ifPresent(a -> {
                        String personId = asBlankNodeId(UUID.randomUUID().toString());
                        Person person1 = new Person(personId, a);
                        setPersonDataFromDataField(dataField, person1);
                        graphList.add(person1);
                        if (getSubfieldValue(dataField, 't').isPresent()) {
                            getSubfieldValue(dataField, 't').ifPresent(title -> {
                                String workAsSubjectId = asBlankNodeId(UUID.randomUUID().toString());
                                graphList.add(new Work(workAsSubjectId, title, personId));
                                work.addSubject(workAsSubjectId);
                            });
                        } else {
                            work.addSubject(personId);
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
                        String corporationId = asBlankNodeId(UUID.randomUUID().toString());
                        Corporation corporation1 = new Corporation(corporationId, a);
                        setCorporationDataFromDataField(dataField, corporation1);
                        graphList.add(corporation1);
                        getSubfieldValue(dataField, 'c').ifPresent(place -> {
                            addExternalObject(graphList, place, PLACE_TYPE, corporation1::setPlace);
                        });
                        work.addSubject(corporationId);
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
                        String eventId = asBlankNodeId(UUID.randomUUID().toString());
                        Event event = new Event(eventId, prefLabel);
                        getSubfieldValue(dataField, 'c').ifPresent(place -> {
                            addExternalObject(graphList, place, PLACE_TYPE, event::setPlace);
                        });
                        getSubfieldValue(dataField, 'd').ifPresent(event::setDate);
                        getSubfieldValue(dataField, 'n').ifPresent(event::setNumber);
                        getSubfieldValue(dataField, 'q').ifPresent(event::setSpecification);
                        graphList.add(event);
                        work.addSubject(eventId);
                    });
                    getSubfieldValue(dataField, 'x').ifPresent(subject -> {
                        addExternalObject(graphList, subject, SUBJECT_TYPE, work::addSubject);
                    });
                    getSubfieldValue(dataField, 'z').ifPresent(place -> {
                        addExternalObject(graphList, place, PLACE_TYPE, work::addSubject);
                    });
                    break;
                case "630":
                    String workAsSubjectId = asBlankNodeId(UUID.randomUUID().toString());
                    Work work1 = new Work(workAsSubjectId);
                    setBibliographicDataFromDataField(dataField, work1);
                    work.addSubject(workAsSubjectId);
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
                    final Person[] publicationPerson = new Person[1];
                    if (getSubfieldValue(dataField, 't').isPresent()) {
                        if (dataField.getIndicator2() == '2') {
                            final PublicationPart[] publicationPart = new PublicationPart[1];
                            getSubfieldValue(dataField, 'a').ifPresent(s -> {
                                final Work[] publicationPartWork = new Work[1];
                                getSubfieldValue(dataField, 't').ifPresent(t -> {
                                    Map<String, Object>[] workPartMap = new Map[1];
                                    workPartMap[0] = composeWork(t);
                                    publicationPartWork[0] = (Work) workPartMap[0].get("work");
                                    publicationPartWorks.add(publicationPartWork[0]);

                                    Map<String, Object> publicationContributionMap = composePublicationPart(s, publicationPartWork[0]);
                                    publication.addPublicationPart((String) publicationContributionMap.get("publicationPartLink"));
                                    publicationPart[0] = (PublicationPart) publicationContributionMap.get("publicationPart");
                                    publicationPerson[0] = (Person) publicationContributionMap.get("person");
                                });
                            });
                            setRole(dataField, publicationPart[0]);
                            setPersonDataFromDataField(dataField, publicationPerson[0]);
                            persons.add(publicationPerson[0]);
                            publicationParts.add(publicationPart[0]);
                        } else {
                            getSubfieldValue(dataField, 'a').ifPresent(personName -> {
                                String personId = asBlankNodeId(UUID.randomUUID().toString());
                                Person person1 = new Person(personId, personName);
                                getSubfieldValue(dataField, 't').ifPresent(title -> {
                                    graphList.add(person1);
                                    String workId1 = asBlankNodeId(UUID.randomUUID().toString());
                                    Work work2 = new Work(workId1, title, personId);
                                    graphList.add(work2);
                                    WorkRelation workRelation = new WorkRelation(asBlankNodeId(UUID.randomUUID().toString()), workId1, dataPrefix(path("relationType", "basedOn")));
                                    graphList.add(workRelation);
                                    work.isRelatedTo(workRelation.getId());
                                });
                            });
                        }
                    } else {
                        final Contribution[] publicationContribution = new Contribution[1];
                        getSubfieldValue(dataField, 'a').ifPresent(s -> {
                            Map<String, Object> publicationContributionMap = composeContribution(s, EntityType.PUBLICATION, new Person());
                            publication.setContributor((String) publicationContributionMap.get("contributorLink"));
                            publicationContribution[0] = (Contribution) publicationContributionMap.get("contribution");
                            publicationPerson[0] = (Person) publicationContributionMap.get("contributor");
                        });
                        setRole(dataField, publicationContribution[0]);
                        setPersonDataFromDataField(dataField, publicationPerson[0]);
                        persons.add(publicationPerson[0]);
                        contributions.add(publicationContribution[0]);
                    }
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

    private ExternalDataObject addExternalObject(Collection<Object> graphList, String prefLabel, String type, Consumer<String> addObjectFunction) {
        String objectId = UUID.randomUUID().toString();
        ExternalDataObject externalDataObject = asExternalObject(objectId, type);
        externalDataObject.setPrefLabel(prefLabel);
        addObjectFunction.accept(externalDataObject.getId());
        graphList.add(externalDataObject);
        return externalDataObject;
    }

    private Named addNamed(Collection<Object> graphList, String name, String type, Consumer<String> addObjectFunction) {
        String objectId = UUID.randomUUID().toString();
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
                .map(this::unPunctuate)
                .map(Role::translate)
                .map(fragment -> path("role", fragment))
                .map(this::dataPrefix)
                .map(this::asExternalObject)
                .ifPresent(contribution::setRole);
    }

    private void setUriObject(DataField dataField, char subField, String path, Consumer<ExternalDataObject> setterFunction, Function<String, String> mapper) {
        getSubfieldValues(dataField, subField)
                .filter(StringUtils::isNotBlank)
                .map(mapper)
                .map(fragment -> path(path, fragment))
                .map(this::dataPrefix)
                .map(this::asExternalObject)
                .forEach(setterFunction);
    }

    private void setUriObject(ControlField controlField, int position, String path, Consumer<ExternalDataObject> setterFunction, Function<String, String> mapper) {
        getControlFieldValue(controlField, position)
                .filter(StringUtils::isNotBlank)
                .map(mapper)
                .map(fragment -> path(path, fragment))
                .map(this::dataPrefix)
                .map(this::asExternalObject)
                .ifPresent(setterFunction);
    }

    private void setPersonDataFromDataField(DataField dataField, Person person) {
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
    }

    private void setCorporationDataFromDataField(DataField dataField, Corporation corporation) {
        getSubfieldValue(dataField, 'b').ifPresent(corporation::setSubdivision);
        getSubfieldValue(dataField, 'q').ifPresent(corporation::setSpecification);
    }

    private ExternalDataObject asExternalObject(String id) {
        ExternalDataObject externalDataObject = new ExternalDataObject();
        externalDataObject.setId(id);
        return externalDataObject;
    }

    private ExternalDataObject toLabeledExternalObject(String prefLabel) {
        ExternalDataObject externalDataObject = new ExternalDataObject();
        externalDataObject.setId(asBlankNodeId(UUID.randomUUID().toString()));
        externalDataObject.setPrefLabel(prefLabel);
        return externalDataObject;
    }

    private String unPunctuate(String punctuated) {
        return punctuated.replace(".", "");
    }

    private String dataPrefix(String unprefixed) {
        return "http://data.deichman.no/" + unprefixed;
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

    private Map<String, Object> composeContribution(String contributor, EntityType entityType, Named contributors) {
        Map<String, Object> returnValue = new HashMap<>();

        final String uuid = UUID.randomUUID().toString();
        final Contribution contribution = new Contribution();

        Map<String, String> publicationAgentLink = new HashMap<>();
        contributors.setId(uuid);
        contributors.setName(contributor);
        publicationAgentLink.put("@id", asBlankNodeId(uuid));
        contributors.setId(uuid);
        contributors.setName(contributor);
        contribution.setId(UUID.randomUUID().toString());
        contribution.setAgent(publicationAgentLink);
        if (entityType == EntityType.WORK) {
            contribution.addType("deichman:MainEntry");
        }

        returnValue.put("contributorLink", contribution.getId());
        returnValue.put("contribution", contribution);
        returnValue.put("contributor", contributors);
        return returnValue;
    }

    private Map<String, Object> composePublicationPart(String person, Work work) {
        Map<String, Object> returnValue = new HashMap<>();

        final String personUuid = UUID.randomUUID().toString();
        final Person persons = new Person();
        final PublicationPart publicationPart = new PublicationPart();

        Map<String, String> agentLink = new HashMap<>();
        persons.setId(personUuid);
        agentLink.put("@id", asBlankNodeId(personUuid));
        persons.setId(personUuid);
        persons.setName(person);
        publicationPart.setId(UUID.randomUUID().toString());
        publicationPart.setAgent(agentLink);

        Map<String, String> workLink = new HashMap<>();
        workLink.put("@id", work.getId());
        publicationPart.setPublicationOf(workLink);

        returnValue.put("publicationPartLink", publicationPart.getId());
        returnValue.put("publicationPart", publicationPart);
        returnValue.put("person", persons);
        return returnValue;
    }

    private String asBlankNodeId(String id) {
        return "_:" + id;
    }

    private Map<String, Object> composeWork(String mainTitle) {
        Map<String, Object> returnValue = new HashMap<>();
        final Work work = new Work();
        work.setId(UUID.randomUUID().toString());
        work.setMainTitle(mainTitle);
        returnValue.put("publicationPartWorkLink", work.getId());
        returnValue.put("work", work);
        return returnValue;
    }
}
