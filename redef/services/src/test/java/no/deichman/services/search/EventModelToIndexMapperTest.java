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
 * Responsibility: unit test PlaceModelToIndexMapper.
 */
public class EventModelToIndexMapperTest extends ModelToIndexMapperTestSupport {

    public EventModelToIndexMapperTest() throws Exception {
    }

    @Test
    public void testModelToIndexDocument_withAlternativeName() throws Exception {
        doTest(true);
    }

    @Test
    public void testModelToIndexDocument_withoutAlternativeName() throws Exception {
        doTest(false);
    }

    private void doTest(boolean withAlternativePlaceName) throws Exception {
        XURI eventUri = new XURI(BaseURI.root(), EntityType.EVENT.getPath(), "e000000001");
        Model model = ModelFactory.createDefaultModel();
        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(eventUri.getUri()),
                RDF.type,
                ResourceFactory.createResource(BaseURI.ontology("Event"))));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(eventUri.getUri()),
                ResourceFactory.createProperty(BaseURI.ontology("specification")),
                ResourceFactory.createPlainLiteral("Jesus (pron. Hey-soos) returns to earth")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(eventUri.getUri()),
                ResourceFactory.createProperty(BaseURI.ontology("prefLabel")),
                ResourceFactory.createPlainLiteral("Jesus returns")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(eventUri.getUri()),
                ResourceFactory.createProperty(BaseURI.ontology("alternativeName")),
                ResourceFactory.createPlainLiteral("alternativeName_value")));

        addPlaceToModel(withAlternativePlaceName, eventUri, model);

        String jsonDocument = new ModelToIndexMapper("event").createIndexDocument(model, eventUri);

        Assert.assertThat(jsonDocument, sameJSONAs(""
                + "{"
                + "  \"uri\": \"" + eventUri.getUri() + "\","
                + "  \"prefLabel\": \"Jesus returns\","
                + "  \"alternativeName\": \"alternativeName_value\","
                + "  \"specification\": \"Jesus (pron. Hey-soos) returns to earth\","
                + "  \"placePrefLabel\": \"" + getPlacePrefLabel() + "\","
                + (withAlternativePlaceName ? "  \"placeAlternativeName\": \"" + getPlaceAlternativeName() + "\"" : "")
                + "}").allowingAnyArrayOrdering());
    }
}
