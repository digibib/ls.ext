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
public class SerialModelToIndexMapperTest extends ModelToIndexMapperTestSupport {

    public SerialModelToIndexMapperTest() throws Exception {
    }

    @Test
    public void testModelToIndexDocument_withAlternativePublisherName() throws Exception {
        doTest(true);
    }

    @Test
    public void testModelToIndexDocument_withoutAlternativePublisherName() throws Exception {
        doTest(false);
    }

    private void doTest(boolean withAlternativePublisherName) throws Exception {
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

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(xuri.getUri()),
                ResourceFactory.createProperty(BaseURI.ontology() + "partTitle"),
                ResourceFactory.createPlainLiteral("Sinne")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(xuri.getUri()),
                ResourceFactory.createProperty(BaseURI.ontology() + "partNumber"),
                ResourceFactory.createPlainLiteral("12")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(xuri.getUri()),
                ResourceFactory.createProperty(BaseURI.ontology() + "issn"),
                ResourceFactory.createPlainLiteral("1234-5678")));

        addPublishedByToModel(withAlternativePublisherName, xuri, model);

        String jsonDocument = new ModelToIndexMapper("serial").createIndexDocument(model, xuri);

        Assert.assertThat(jsonDocument, sameJSONAs(""
                + "{"
                + "  \"uri\": \"" + xuri.getUri() + "\","
                + "  \"serialMainTitle\": \"Blå Lanterne\","
                + "  \"subtitle\": \"Følelser i sentrum\","
                + "  \"publishedByName\": \"" + getPublishedByName() + "\","
                + "  \"publishedByPlacePrefLabel\": \"" + getPlacePrefLabel() + "\","
                + "  \"partTitle\": \"Sinne\","
                + "  \"partNumber\": \"12\","
                + "  \"issn\": \"1234-5678\","
                + (withAlternativePublisherName ? "  \"publishedByAlternativeName\": \"" + getPublishedByAlternativeName() + "\"," : "")
                + (withAlternativePublisherName ? "  \"publishedByPlaceAlternativeName\": \"" + getPlaceAlternativeName() + "\"" : "")
                + "}").allowingAnyArrayOrdering());
    }

}
