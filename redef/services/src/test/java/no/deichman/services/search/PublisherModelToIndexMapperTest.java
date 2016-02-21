package no.deichman.services.search;

import no.deichman.services.uridefaults.BaseURI;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.ResourceFactory;
import org.apache.jena.vocabulary.RDF;
import org.junit.Assert;
import org.junit.Test;

import static uk.co.datumedge.hamcrest.json.SameJSONAs.sameJSONAs;

/**
 * Responsibility: unit test PublisherModelToIndexMapper.
 */
public class PublisherModelToIndexMapperTest {
    private BaseURI baseURI = BaseURI.local();
    @Test
    public void testModelToIndexDocument() throws Exception {
        Model model = ModelFactory.createDefaultModel();
        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(baseURI.getBaseUriRoot() + "publisher_1"),
                RDF.type,
                ResourceFactory.createResource(baseURI.ontology() + "Publisher")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(baseURI.getBaseUriRoot() + "publisher_1"),
                ResourceFactory.createProperty(baseURI.getBaseUriRoot() + "a_prop"),
                ResourceFactory.createPlainLiteral("a_prop_value")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(baseURI.getBaseUriRoot() + "publisher_1"),
                ResourceFactory.createProperty(baseURI.ontology() + "name"),
                ResourceFactory.createPlainLiteral("publisherName_value")));

        Pair<String, String> uriAndDocument = PublisherModelToIndexMapper.getModelToIndexMapperBuilder()
                .withOntologyPrefix(baseURI.ontology())
                .build()
                .modelToIndexDocument(model)
                .get();

        Assert.assertEquals("http://deichman.no/publisher_1", uriAndDocument.getKey());

        String jsonDocument = uriAndDocument.getValue();
        Assert.assertThat(jsonDocument, sameJSONAs(""
                + "{"
                + "  \"publisher\": {"
                + "      \"uri\": \"" + baseURI.getBaseUriRoot() + "publisher_1\","
                + "      \"name\": \"publisherName_value\""
                + "  }\n"
                + "}").allowingAnyArrayOrdering());
    }
}
