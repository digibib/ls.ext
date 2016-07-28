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
 * Responsibility: unit test PublisherModelToIndexMapper.
 */
public class CorporationModelToIndexMapperTest {
    private BaseURI baseURI = BaseURI.local();
    @Test
    public void testModelToIndexDocument() throws Exception {
        XURI xuri = new XURI(baseURI.getBaseUriRoot(), EntityType.CORPORATION.getPath(), "h00000121");
        Model model = ModelFactory.createDefaultModel();
        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(xuri.getUri()),
                RDF.type,
                ResourceFactory.createResource(baseURI.ontology() + "Corporation")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(xuri.getUri()),
                ResourceFactory.createProperty(baseURI.getBaseUriRoot() + "a_prop"),
                ResourceFactory.createPlainLiteral("a_prop_value")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(xuri.getUri()),
                ResourceFactory.createProperty(baseURI.ontology() + "name"),
                ResourceFactory.createPlainLiteral("publisherName_value")));

        String jsonDocument = new ModelToIndexMapper("corporation", BaseURI.local()).createIndexDocument(model, xuri);

        Assert.assertThat(jsonDocument, sameJSONAs(""
                + "{"
                + "  \"uri\": \"" + xuri.getUri() + "\","
                + "  \"name\": \"publisherName_value\""
                + "}").allowingAnyArrayOrdering());
    }
}
