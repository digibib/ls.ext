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
 * Responsibility: unit test ModelToIndexMapper serial.
 */
public class SerialModelToIndexMapperTest {

    @Test
    public void testModelToIndexDocument() throws Exception {
        XURI xuri = new XURI(BaseURI.root(), EntityType.SERIAL.getPath(), "s000000001");
        Model model = ModelFactory.createDefaultModel();
        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(xuri.getUri()),
                RDF.type,
                ResourceFactory.createResource(BaseURI.ontology("Serial"))));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(xuri.getUri()),
                ResourceFactory.createProperty(BaseURI.ontology() + "mainTitle"),
                ResourceFactory.createPlainLiteral("Blå Lanterne")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(xuri.getUri()),
                ResourceFactory.createProperty(BaseURI.ontology("subtitle")),
                ResourceFactory.createPlainLiteral("Følelser i sentrum")));

        String jsonDocument = new ModelToIndexMapper("serial").createIndexDocument(model, xuri);

        Assert.assertThat(jsonDocument, sameJSONAs(""
                + "{"
                + "  \"uri\": \"" + xuri.getUri() + "\","
                + "  \"serialMainTitle\": \"Blå Lanterne\","
                + "  \"subtitle\": \"Følelser i sentrum\","
                + "}").allowingAnyArrayOrdering());
    }
}
