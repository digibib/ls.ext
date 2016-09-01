package no.deichman.services.entity.z3950;

import no.deichman.services.entity.EntityType;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.marc4j.MarcReader;
import org.marc4j.MarcXmlReader;
import org.marc4j.marc.ControlField;
import org.marc4j.marc.DataField;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.stream.Stream;

import static java.lang.String.format;

/**
 * Responsibility: Map MARC21 to JSON representation.
 */
@SuppressWarnings("checkstyle:MethodLength")
public class MARCMapper {

    public static final int TWENTY_TWO = 22;
    public static final int THIRTY_THREE = 33;

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

        for (ControlField controlField: r.getControlFields()){
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
                        Map<String, Object> workContributionMap = composeContribution(s, EntityType.WORK);
                        work.setContributor(s);
                        work.setContributor((String) workContributionMap.get("contributorLink"));
                        workContribution[0] = (Contribution) workContributionMap.get("contribution");
                        person[0] = (Person) workContributionMap.get("person");
                    });
                    setPersonDataFromDataField(dataField, person[0]);
                    setRole(dataField, workContribution[0]);

                    persons.add(person[0]);
                    contributions.add(workContribution[0]);
                    break;
                case "240":
                    getSubfieldValue(dataField, 'a').ifPresent(work::setMainTitle);
                    getSubfieldValue(dataField, 'b').ifPresent(work::setSubtitle);
                    break;
                case "245":
                    boolean standardTitleExists = r.getVariableFields("240").size() != 0;

                    getSubfieldValue(dataField, 'a').ifPresent(s -> {
                        publication.setMainTitle(s);
                        if (!standardTitleExists) {
                            work.setMainTitle(s);
                        }
                    });

                    getSubfieldValue(dataField, 'b').ifPresent(s -> {
                        publication.setSubtitle(s);
                        if (!standardTitleExists) {
                            work.setSubtitle(s);
                        }
                    });
                    break;
                case "250":
                    getSubfieldValue(dataField, 'a').ifPresent(publication::setEdition);
                    break;
                case "260":
                    getSubfieldValue(dataField, 'a').ifPresent(publication::setPlaceOfPublication);
                    getSubfieldValue(dataField, 'b').ifPresent(publication::setPublisher);
                    getSubfieldValue(dataField, 'c').ifPresent(publication::setPublicationYear);
                    break;
                case "300":
                    getSubfieldValue(dataField, 'a').ifPresent(publication::setNumberOfPages);
                    break;
                case "520":
                    if (dataField.getIndicator1() == ' ') {
                        getSubfieldValue(dataField, 'a').ifPresent(work::setHasSummary);
                    }
                    break;
                case "650":
                    mapPrimaryAndSubDivisionSubject(work, graphList, dataField, "deichman:Subject", "deichman:Place", 'z');
                    break;
                case "651":
                    mapPrimaryAndSubDivisionSubject(work, graphList, dataField, "deichman:Place", "deichman:Subject", 'x');
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
                        }
                    } else {
                        final Contribution[] publicationContribution = new Contribution[1];
                        getSubfieldValue(dataField, 'a').ifPresent(s -> {
                            Map<String, Object> publicationContributionMap = composeContribution(s, EntityType.PUBLICATION);
                            publication.setContributor((String) publicationContributionMap.get("contributorLink"));
                            publicationContribution[0] = (Contribution) publicationContributionMap.get("contribution");
                            publicationPerson[0] = (Person) publicationContributionMap.get("person");
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

        if (persons.size() > 0) {
            graphList.addAll(persons);
        }

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

    private void mapPrimaryAndSubDivisionSubject(
            Work work,
            Collection<Object> graphList,
            DataField dataField,
            String primarySubjectType,
            String subDivisionSubjectType,
            char subDivisionField) {
        getSubfieldValue(dataField, 'a').ifPresent(a ->{
            ExternalDataObject subject = addExternalObject(graphList, a, primarySubjectType, work::addSubject);
            getSubfieldValue(dataField, 'q').ifPresent(subject::setSpecification);
        });
        getSubfieldValue(dataField, subDivisionField).ifPresent(a ->{
            addExternalObject(graphList, a, subDivisionSubjectType, work::addSubject);
        });
    }

    private ExternalDataObject addExternalObject(Collection<Object> graphList, String a, String type, Consumer<String> addObjectFunction) {
        String objectId = UUID.randomUUID().toString();
        ExternalDataObject externalDataObject = externalObject(objectId, type);
        externalDataObject.setPrefLabel(a);
        addObjectFunction.accept(externalDataObject.getId());
        graphList.add(externalDataObject);
        return externalDataObject;
    }

    private ExternalDataObject externalObject(String subjectId, String type) {
        ExternalDataObject externalDataObject = externalObject(subjectId);
        externalDataObject.setType(type);
        return externalDataObject;
    }

    private void setRole(DataField dataField, Contribution contribution) {
        getSubfieldValue(dataField, 'e', "contributor")
                .map(this::unPunctuate)
                .map(Role::translate)
                .map(fragment -> path("role", fragment))
                .map(this::dataPrefix)
                .map(this::externalObject)
                .ifPresent(contribution::setRole);
    }

    private void setUriObject(DataField dataField, char subField, String path, Consumer<ExternalDataObject> setterFunction, Function<String, String> mapper) {
        getSubfieldValues(dataField, subField)
                .filter(StringUtils::isNotBlank)
                .map(mapper)
                .map(fragment -> path(path, fragment))
                .map(this::dataPrefix)
                .map(this::externalObject)
                .forEach(setterFunction);
    }

    private void setUriObject(ControlField controlField, int position, String path, Consumer<ExternalDataObject> setterFunction, Function<String, String> mapper) {
        getControlFieldValue(controlField, position)
                .filter(StringUtils::isNotBlank)
                .map(mapper)
                .map(fragment -> path(path, fragment))
                .map(this::dataPrefix)
                .map(this::externalObject)
                .ifPresent(setterFunction);
    }

    private void setPersonDataFromDataField(DataField dataField, Person person) {
        getSubfieldValue(dataField, 'd').ifPresent(person::setDates);
        getSubfieldValue(dataField, 'c').ifPresent(person::setSpecification);
        getSubfieldValue(dataField, 'j')
                .map(this::unPunctuate)
                .map(fragment -> path("nationality", fragment))
                .map(this::dataPrefix)
                .map(this::externalObject)
                .ifPresent(person::setNationality);
    }

    private ExternalDataObject externalObject(String id) {
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

    private Stream<String> getSubfieldValues(DataField dataField, Character character, String ... separators) {
        String separator = separators.length > 0 ? separators[0] : ",";
        return Arrays.stream(getSubfieldValue(dataField, character).orElse("").split(separator)).filter(StringUtils::isNotBlank);
    }

    private Map<String, Object> composeContribution(String person, EntityType entityType) {
        Map<String, Object> returnValue = new HashMap<>();

        final String uuid = UUID.randomUUID().toString();
        final Person persons = new Person();
        final Contribution contribution = new Contribution();

        Map<String, String> publicationAgentLink = new HashMap<>();
        persons.setId(uuid);
        persons.setName(person);
        publicationAgentLink.put("@id", "_:" + uuid);
        persons.setId(uuid);
        persons.setName(person);
        contribution.setId(UUID.randomUUID().toString());
        contribution.setAgent(publicationAgentLink);
        if (entityType == EntityType.WORK) {
            contribution.addType("deichman:MainEntry");
        }

        returnValue.put("contributorLink", contribution.getId());
        returnValue.put("contribution", contribution);
        returnValue.put("person", persons);
        return returnValue;
    }

    private Map<String, Object> composePublicationPart(String person, Work work) {
        Map<String, Object> returnValue = new HashMap<>();

        final String personUuid = UUID.randomUUID().toString();
        final Person persons = new Person();
        final PublicationPart publicationPart = new PublicationPart();

        Map<String, String> agentLink = new HashMap<>();
        persons.setId(personUuid);
        agentLink.put("@id", "_:" + personUuid);
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
