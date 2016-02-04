package no.deichman.services.search;

import static no.deichman.services.search.ModelToIndexMapper.ModelToIndexMapperBuilder.modelToIndexMapperBuilder;

/**
 * Responsibility: Map from work model to index document.
 */
public final class WorkModelToIndexMapper {
    private WorkModelToIndexMapper() {
    }

    public static final String WORK_INDEX_TYPE = "work";
    private static final String WORK_MODEL_TO_INDEX_DOCUMENT_QUERY = "PREFIX  : <%1$s> \n"
            + "PREFIX  rdfs:<http://www.w3.org/2000/01/rdf-schema#>\n"
            + "PREFIX  duo:<http://data.deichman.no/utility#>\n"
            + "select distinct ?work ?mainTitles ?partTitles ?creator ?creatorName ?birth ?death ?formats\n"
            + "where {\n"
            + "   ?work a :Work .\n"
            + "   optional {\n"
            + "     SELECT ?work (GROUP_CONCAT (concat(?mainTitle, \"@\", lang(?mainTitle)); separator='|') AS ?mainTitles) \n"
            + "     where {\n"
            + "         ?work a :Work .\n"
            + "         ?work :mainTitle ?mainTitle .\n"
            + "     }\n"
            + "     group by ?work\n"
            + "   }\n"
            + "   optional {\n"
            + "      select ?work \n"
            + "      (GROUP_CONCAT (concat(?partTitle, \"@\", lang(?partTitle)); separator='|') AS ?partTitles) \n"
            + "      where {\n"
            + "         ?work a :Work ;\n"
            + "               :partTitle ?partTitle .\n"
            + "      }\n"
            + "      group by ?work \n"
            + "   }\n"
            + "   optional {\n"
            + "      select ?work \n"
            + "      (GROUP_CONCAT (?formatLabel; separator='|') AS ?formats)\n"
            + "      where {\n"
            + "         ?pub :publicationOf ?work ;\n"
            + "              :format ?format .\n"
            + "         ?format rdfs:label ?formatLabel .\n"
            + "      }\n"
            + "      group by ?work \n"
            + "   }\n"
            + "   optional { \n"
            + "       ?work :creator ?creator .\n"
            + "       ?creator a :Person ;\n"
            + "                :name ?creatorName.\n"
            + "       optional {?creator :birthYear ?birth.}\n"
            + "       optional {?creator :deathYear ?death.}\n"
            + "   }\n"
            + "}\n";

    private static ModelToIndexMapper worksModelToIndexMapper = getModelToIndexMapperBuilder()
            .build();

    static ModelToIndexMapper.ModelToIndexMapperBuilder getModelToIndexMapperBuilder() {
        return modelToIndexMapperBuilder()
                .targetIndexType(WORK_INDEX_TYPE)
                .selectQuery(WORK_MODEL_TO_INDEX_DOCUMENT_QUERY)
                .mapFromResultVar("mainTitles").toLanguageSpecifiedJsonPath("work.mainTitle")
                .mapFromResultVar("partTitles").toLanguageSpecifiedJsonPath("work.partTitle")
                .mapFromResultVar("creatorName").toJsonPath("work.creator.name")
                .mapFromResultVar("formats").toJsonStringArray("work.formats")
                .mapFromResultVar("work").toJsonPath("work.uri")
                .mapFromResultVar("creator").toJsonPath("work.creator.uri")
                .mapFromResultVar("birth").toJsonPath("work.creator.birthYear")
                .mapFromResultVar("death").toJsonPath("work.creator.deathYear");
    }

    public static ModelToIndexMapper getworksModelToIndexMapper() {
        return worksModelToIndexMapper;
    }
}
