package no.deichman.services.search;

import no.deichman.services.entity.EntityType;
import no.deichman.services.uridefaults.BaseURI;
import no.deichman.services.uridefaults.XURI;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.ResourceFactory;
import org.apache.jena.vocabulary.RDF;
import org.junit.Assert;
import org.junit.Test;

import static uk.co.datumedge.hamcrest.json.SameJSONAs.sameJSONAs;

/**
 * Responsibility: unit test PlaceOfPublicationModelToIndexMapper.
 */
public class PlaceOfPublicationModelToIndexMapperTest {
    private BaseURI baseURI = BaseURI.local();

    @Test
    public void testModelToIndexDocument() throws Exception {
        XURI placeOfPublicationXuri1 = new XURI(baseURI.getBaseUriRoot(), EntityType.PLACE_OF_PUBLICATION.getPath(), "g000000001");
        Model model = ModelFactory.createDefaultModel();
        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(placeOfPublicationXuri1.getUri()),
                RDF.type,
                ResourceFactory.createResource(baseURI.ontology() + "PlaceOfPublication")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(placeOfPublicationXuri1.getUri()),
                ResourceFactory.createProperty(baseURI.ontology() + "country"),
                ResourceFactory.createPlainLiteral("a_country_value")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(placeOfPublicationXuri1.getUri()),
                ResourceFactory.createProperty(baseURI.ontology() + "place"),
                ResourceFactory.createPlainLiteral("placeOfPublicationName_value")));

        String jsonDocument = new ModelToIndexMapper("placeOfPublication", BaseURI.local()).createIndexDocument(model, placeOfPublicationXuri1);

        Assert.assertThat(jsonDocument, sameJSONAs(""
                + "{"
                + "  \"placeOfPublication\": {"
                + "      \"uri\": \"" + placeOfPublicationXuri1.getUri() + "\","
                + "      \"place\": \"placeOfPublicationName_value\","
                + "      \"country\": \"a_country_value\","
                + "  }\n"
                + "}").allowingAnyArrayOrdering());
    }
}
