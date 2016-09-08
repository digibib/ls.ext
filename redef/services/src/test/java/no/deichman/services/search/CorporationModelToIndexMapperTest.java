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
 * Responsibility: unit test CorporationModelToIndexMapper.
 */
public class CorporationModelToIndexMapperTest {
    @Test
    public void testModelToIndexDocument() throws Exception {
        XURI xuri = new XURI(BaseURI.root(), EntityType.CORPORATION.getPath(), "h00000121");
        Model model = ModelFactory.createDefaultModel();
        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(xuri.getUri()),
                RDF.type,
                ResourceFactory.createResource(BaseURI.ontology("Corporation"))));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(xuri.getUri()),
                ResourceFactory.createProperty(BaseURI.root() + "a_prop"),
                ResourceFactory.createPlainLiteral("a_prop_value")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(xuri.getUri()),
                ResourceFactory.createProperty(BaseURI.ontology("name")),
                ResourceFactory.createPlainLiteral("publisherName_value")));

        String jsonDocument = new ModelToIndexMapper("corporation").createIndexDocument(model, xuri);

        Assert.assertThat(jsonDocument, sameJSONAs(""
                + "{"
                + "  \"uri\": \"" + xuri.getUri() + "\","
                + "  \"name\": \"publisherName_value\""
                + "}").allowingAnyArrayOrdering());
    }
}
