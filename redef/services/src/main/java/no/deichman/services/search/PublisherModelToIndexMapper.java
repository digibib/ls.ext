package no.deichman.services.search;

import static no.deichman.services.search.ModelToIndexMapper.ModelToIndexMapperBuilder.modelToIndexMapperBuilder;

/**
 * Responsibility: Map from publisher model to index document.
 */
public final class PublisherModelToIndexMapper {
    private PublisherModelToIndexMapper() {

    }

    public static final String PUBLISHER_INDEX_TYPE = "publisher";
    private static final String PUBLISHER_TO_INDEX_DOCUMENT_QUERY = ""
            + "PREFIX  : <%1$s> \n"
            + "PREFIX  rdfs:<http://www.w3.org/2000/01/rdf-schema#>\n"
            + "select distinct ?" + PUBLISHER_INDEX_TYPE + " ?name\n"
            + "where {\n"
            + "    ?" + PUBLISHER_INDEX_TYPE + " a :Publisher ;\n"
            + "             :name ?name .\n"
            + "}\n";

    private static ModelToIndexMapper publisherModelToIndexMapper = getModelToIndexMapperBuilder()
            .build();

    static ModelToIndexMapper.ModelToIndexMapperBuilder getModelToIndexMapperBuilder() {
        return modelToIndexMapperBuilder()
                .targetIndexType(PUBLISHER_INDEX_TYPE)
                .selectQuery(PUBLISHER_TO_INDEX_DOCUMENT_QUERY)
                .mapFromResultVar(PUBLISHER_INDEX_TYPE).toJsonPath("publisher.uri")
                .mapFromResultVar("name").toJsonPath("publisher.name");
    }

    public static ModelToIndexMapper getPublisherModelToIndexMapper() {
        return publisherModelToIndexMapper;
    }
}
