package no.deichman.services.search;

import static no.deichman.services.search.ModelToIndexMapper.ModelToIndexMapperBuilder.modelToIndexMapperBuilder;

/**
 * Responsibility: Map from person model to index document.
 */
public final class PersonModelToIndexMapper {
    private PersonModelToIndexMapper() {
    }

    public static final String PERSON_INDEX_TYPE = "person";
    private static final String PERSON_MODEL_TO_INDEX_DOCUMENT_QUERY = ""
            + "PREFIX  : <%1$s> \n"
            + "PREFIX  duo:<http://data.deichman.no/utility#>\n"
            + "PREFIX  rdfs:<http://www.w3.org/2000/01/rdf-schema#>\n"
            + "select distinct ?person ?personName ?nationalityLabel ?birth ?death ?work ?mainTitles ?partTitles\n"
            + "where {\n"
            + "   ?person a :Person ;\n"
            + "           :name ?personName\n"
            + "   optional {?person :birthYear ?birth.}\n"
            + "   optional {?person :deathYear ?death.}\n"
            + "   optional {?person :nationality ?nationality. \n"
            + "              ?nationality a duo:Nationality; \n"
            + "                           rdfs:label ?nationalityLabel. "
            + "   } \n"
            + "   optional {\n"
            + "       ?work a :Work ;\n"
            + "             :creator ?person ;\n"
            + "       optional {\n"
            + "             SELECT ?work (GROUP_CONCAT (concat(?mainTitle, \"@\", lang(?mainTitle)); separator='|') AS ?mainTitles) \n"
            + "             where {\n"
            + "                 ?work a :Work .\n"
            + "                 ?work :mainTitle ?mainTitle .\n"
            + "             }\n"
            + "             group by ?work\n"
            + "       }\n"
            + "       optional {\n"
            + "              select ?work (GROUP_CONCAT (concat(?partTitle, \"@\", lang(?partTitle)); separator='|') AS ?partTitles) \n"
            + "              where {\n"
            + "                  ?work a :Work ;\n"
            + "                        :partTitle ?partTitle .\n"
            + "              }\n"
            + "             group by ?work \n"
            + "       }\n"
            + "       ?work :creator ?creator .\n"
            + "    }\n"
            + "} group by ?person ?personName ?nationalityLabel ?birth ?death ?work ?mainTitles ?partTitles\n";

    private static ModelToIndexMapper personModelToIndexMapper = getModelToIndexMapperBuilder()
            .build();

    static ModelToIndexMapper.ModelToIndexMapperBuilder getModelToIndexMapperBuilder() {
        return modelToIndexMapperBuilder()
                .targetIndexType(PERSON_INDEX_TYPE)
                .selectQuery(PERSON_MODEL_TO_INDEX_DOCUMENT_QUERY)
                .mapFromResultVar("person").toJsonPath("person.uri")
                .mapFromResultVar("personName").toJsonPath("person.name")
                .mapFromResultVar("birth").toJsonPath("person.birthYear")
                .mapFromResultVar("death").toJsonPath("person.deathYear")
                .mapFromResultVar("nationalityLabel").toJsonPath("person.nationality")
                .mapFromResultVar("work").toJsonObjectArray("person.work").withObjectMember("uri")
                .arrayGroupBy("work")
                .mapFromResultVar("mainTitles").toJsonObjectArray("person.work").withLanguageSpecifiedObjectMember("mainTitle")
                .mapFromResultVar("partTitles").toJsonObjectArray("person.work").withLanguageSpecifiedObjectMember("partTitle");
    }

    public static ModelToIndexMapper getPersonModelToIndexMapper() {
        return personModelToIndexMapper;
    }
}
