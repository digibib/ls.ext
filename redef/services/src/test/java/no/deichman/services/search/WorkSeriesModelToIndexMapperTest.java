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
 * Responsibility: unit test ModelToIndexMapper for work series.
 */
public class WorkSeriesModelToIndexMapperTest {

    @Test
    public void testModelToIndexDocument() throws Exception {
        XURI xuri = new XURI(BaseURI.root(), EntityType.WORK_SERIES.getPath(), "v000000001");
        Model model = ModelFactory.createDefaultModel();
        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(xuri.getUri()),
                RDF.type,
                ResourceFactory.createResource(BaseURI.ontology("WorkSeries"))));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(xuri.getUri()),
                ResourceFactory.createProperty(BaseURI.ontology() + "mainTitle"),
                ResourceFactory.createPlainLiteral("Hellerudfolket")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(xuri.getUri()),
                ResourceFactory.createProperty(BaseURI.ontology() + "partTitle"),
                ResourceFactory.createPlainLiteral("På lykke og fromme")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(xuri.getUri()),
                ResourceFactory.createProperty(BaseURI.ontology() + "partNumber"),
                ResourceFactory.createPlainLiteral("42")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(xuri.getUri()),
                ResourceFactory.createProperty(BaseURI.ontology("subtitle")),
                ResourceFactory.createPlainLiteral("Sagaen om Bård og Passop")));

        String jsonDocument = new ModelToIndexMapper("workSeries").createIndexDocument(model, xuri);

        Assert.assertThat(jsonDocument, sameJSONAs(""
                + "{"
                + "  \"uri\": \"" + xuri.getUri() + "\","
                + "  \"workSeriesMainTitle\": \"Hellerudfolket\","
                + "  \"subtitle\": \"Sagaen om Bård og Passop\","
                + "  \"partTitle\": \"På lykke og fromme\","
                + "  \"partNumber\": \"42\","
                + "  \"displayLine1\": \"Hellerudfolket : Sagaen om Bård og Passop. 42. På lykke og fromme\","
                + "}").allowingAnyArrayOrdering());
    }
}
