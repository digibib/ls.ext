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
public class PlaceModelToIndexMapperTest {

    @Test
    public void testModelToIndexDocument() throws Exception {
        XURI placeXuri1 = new XURI(BaseURI.root(), EntityType.PLACE.getPath(), "g000000001");
        Model model = ModelFactory.createDefaultModel();
        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(placeXuri1.getUri()),
                RDF.type,
                ResourceFactory.createResource(BaseURI.ontology("Place"))));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(placeXuri1.getUri()),
                ResourceFactory.createProperty(BaseURI.ontology("specification")),
                ResourceFactory.createPlainLiteral("Telemark")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(placeXuri1.getUri()),
                ResourceFactory.createProperty(BaseURI.ontology("prefLabel")),
                ResourceFactory.createPlainLiteral("Bø")));

        String jsonDocument = new ModelToIndexMapper("place").createIndexDocument(model, placeXuri1);

        Assert.assertThat(jsonDocument, sameJSONAs(""
                + "{"
                + "  \"uri\": \"" + placeXuri1.getUri() + "\","
                + "  \"prefLabel\": \"Bø\","
                + "  \"specification\": \"Telemark\","
                + "  \"displayLine1\": \"Bø (Telemark)\","
                + "}").allowingAnyArrayOrdering());
    }
}
