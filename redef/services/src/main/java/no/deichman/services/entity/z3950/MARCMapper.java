package no.deichman.services.entity.z3950;

import no.deichman.services.entity.EntityType;
import org.apache.commons.io.IOUtils;
import org.marc4j.MarcReader;
import org.marc4j.MarcXmlReader;
import org.marc4j.marc.DataField;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Responsibility: Map MARC21 to JSON representation.
 */
public class MARCMapper {

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

        Work work = new Work();

        String workId = UUID.randomUUID().toString();
        work.setId(workId);

        Publication publication = new Publication();
        publication.setPublicationOf(workId);

        List<Object> graphList = new ArrayList<>();
        for (DataField dataField : r.getDataFields()) {
            switch (dataField.getTag()) {
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
                    getSubfieldValue(dataField, 'd').ifPresent(person[0]::setDates);
                    getSubfieldValue(dataField, 'e').ifPresent(workContribution[0]::setRole);
                    persons.add(person[0]);
                    contributions.add(workContribution[0]);
                    break;
                case "240":
                    getSubfieldValue(dataField, 'a').ifPresent(work::setMainTitle);
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
                case "700":
                    final Person[] publicationPerson = new Person[1];
                    final Contribution[] publicationContribution = new Contribution[1];
                    getSubfieldValue(dataField, 'a').ifPresent(s -> {
                        Map<String, Object> publicationContributionMap = composeContribution(s, EntityType.PUBLICATION);
                        publication.setContributor((String) publicationContributionMap.get("contributorLink"));
                        publicationContribution[0] = (Contribution) publicationContributionMap.get("contribution");
                        publicationPerson[0] = (Person) publicationContributionMap.get("person");
                    });
                    getSubfieldValue(dataField, 'd').ifPresent(publicationPerson[0]::setDates);
                    getSubfieldValue(dataField, 'e').ifPresent(publicationContribution[0]::setRole);
                    persons.add(publicationPerson[0]);
                    contributions.add(publicationContribution[0]);
                    break;
                default:
                    //we're not interested in the content so we do nothing -- checkstyle requires default.
                    break;
            }
        }

        if (persons.size() > 0) {
            graphList.addAll(persons);
        }


        graphList.add(work);
        graphList.add(publication);

        Map<String, Object> topLevelMap = new HashMap<>();
        topLevelMap.put("@context", new ContextObject().getContext());
        topLevelMap.put("@graph", graphList);
        graphList.addAll(contributions);

        return topLevelMap;
    }

    private Optional<String> getSubfieldValue(DataField dataField, Character character) {
        Optional<String> data = Optional.empty();
        if (dataField.getSubfield(character) != null) {
            data = Optional.of(dataField.getSubfield(character).getData());
        }
        return data;
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
            contribution.setType("deichman:MainEntry");
        }

        returnValue.put("contributorLink", contribution.getId());
        returnValue.put("contribution", contribution);
        returnValue.put("person", persons);
        return returnValue;
    }
}
