package no.deichman.services.search;

import static java.lang.String.format;
import static no.deichman.services.search.ModelToIndexMapper.ModelToIndexMapperBuilder.modelToIndexMapperBuilder;
import static no.deichman.services.uridefaults.BaseURI.remote;

/**
 * Responsibility: Expose a subset of Elasticsearch REST API limited to searching for places of publication.
 */
public final class PlaceOfPublicationModelToIndexMapper {
    private PlaceOfPublicationModelToIndexMapper() {

    }

    public static final String PLACE_OF_PUBLICATION_INDEX_TYPE = "placeOfPublication";
    private static final String PLACE_OF_PUBLICATION_TO_INDEX_DOCUMENT_QUERY = format(""
            + "PREFIX  : <%1$s> \n"
            + "PREFIX  rdfs:<http://www.w3.org/2000/01/rdf-schema#>\n"
            + "select distinct ?" + PLACE_OF_PUBLICATION_INDEX_TYPE + " ?place ?country\n"
            + "where {\n"
            + "    ?" + PLACE_OF_PUBLICATION_INDEX_TYPE + " a :PlaceOfPublication ;\n"
            + "             :place ?place ;\n"
            + "             :country ?country .\n"
            + "}\n", remote().ontology());

    private static ModelToIndexMapper placeOfPublicationModelToIndexMapper = getModelToIndexMapperBuilder()
            .build();

    static ModelToIndexMapper.ModelToIndexMapperBuilder getModelToIndexMapperBuilder() {
        return modelToIndexMapperBuilder()
                .targetIndexType(PLACE_OF_PUBLICATION_INDEX_TYPE)
                .selectQuery(PLACE_OF_PUBLICATION_TO_INDEX_DOCUMENT_QUERY)
                .mapFromResultVar(PLACE_OF_PUBLICATION_INDEX_TYPE).toJsonPath("placeOfPublication.uri")
                .mapFromResultVar("place").toJsonPath("placeOfPublication.place")
                .mapFromResultVar("country").toJsonPath("placeOfPublication.country");
    }

    public static ModelToIndexMapper getPlaceOfPublicationModelToIndexMapper() {
        return placeOfPublicationModelToIndexMapper;
    }
}
