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
public class InstrumentModelToIndexMapperTest {

    @Test
    public void testModelToIndexDocument() throws Exception {
        XURI placeXuri1 = new XURI(BaseURI.root(), EntityType.MUSICAL_INSTRUMENT.getPath(), "e000000001");
        Model model = ModelFactory.createDefaultModel();
        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(placeXuri1.getUri()),
                RDF.type,
                ResourceFactory.createResource(BaseURI.ontology("Instrument"))));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(placeXuri1.getUri()),
                ResourceFactory.createProperty(BaseURI.ontology("specification")),
                ResourceFactory.createPlainLiteral("Large chicken leg with strings")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(placeXuri1.getUri()),
                ResourceFactory.createProperty(BaseURI.ontology("prefLabel")),
                ResourceFactory.createPlainLiteral("Lute")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(placeXuri1.getUri()),
                ResourceFactory.createProperty(BaseURI.ontology("alternativeName")),
                ResourceFactory.createPlainLiteral("alternativeName_value")));

        String jsonDocument = new ModelToIndexMapper("instrument").createIndexDocument(model, placeXuri1);

        Assert.assertThat(jsonDocument, sameJSONAs(""
                + "{"
                + "  \"uri\": \"" + placeXuri1.getUri() + "\","
                + "  \"prefLabel\": \"Lute\","
                + "  \"alternativeName\": \"alternativeName_value\","
                + "  \"displayLine1\": \"Lute (Large chicken leg with strings)\","
                + "  \"specification\": \"Large chicken leg with strings\","
                + "}").allowingAnyArrayOrdering());
    }
}
