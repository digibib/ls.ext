package no.deichman.services.search;

import no.deichman.services.uridefaults.BaseURI;
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
        Model model = ModelFactory.createDefaultModel();
        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(baseURI.getBaseUriRoot() + "placeOfPublication_1"),
                RDF.type,
                ResourceFactory.createResource(baseURI.ontology() + "PlaceOfPublication")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(baseURI.getBaseUriRoot() + "placeOfPublication_1"),
                ResourceFactory.createProperty(baseURI.ontology() + "country"),
                ResourceFactory.createPlainLiteral("a_country_value")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(baseURI.getBaseUriRoot() + "placeOfPublication_1"),
                ResourceFactory.createProperty(baseURI.ontology() + "place"),
                ResourceFactory.createPlainLiteral("placeOfPublicationName_value")));

        String jsonDocument = new ModelToIndexMapper("placeOfPublication", BaseURI.local()).createIndexDocument(model, "http://deichman.no/placeOfPublication_1");

        Assert.assertThat(jsonDocument, sameJSONAs(""
                + "{"
                + "  \"placeOfPublication\": {"
                + "      \"uri\": \"" + baseURI.getBaseUriRoot() + "placeOfPublication_1\","
                + "      \"place\": \"placeOfPublicationName_value\","
                + "      \"country\": \"a_country_value\","
                + "  }\n"
                + "}").allowingAnyArrayOrdering());
    }
}
