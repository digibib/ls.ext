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
public class CompositionTypeModelToIndexMapperTest {

    @Test
    public void testModelToIndexDocument() throws Exception {
        XURI placeXuri1 = new XURI(BaseURI.root(), EntityType.MUSICAL_COMPOSITION_TYPE.getPath(), "e000000001");
        Model model = ModelFactory.createDefaultModel();
        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(placeXuri1.getUri()),
                RDF.type,
                ResourceFactory.createResource(BaseURI.ontology("CompositionType"))));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(placeXuri1.getUri()),
                ResourceFactory.createProperty(BaseURI.ontology("specification")),
                ResourceFactory.createPlainLiteral("Not over before the fat lady sings")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(placeXuri1.getUri()),
                ResourceFactory.createProperty(BaseURI.ontology("prefLabel")),
                ResourceFactory.createPlainLiteral("Opera")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(placeXuri1.getUri()),
                ResourceFactory.createProperty(BaseURI.ontology("alternativeName")),
                ResourceFactory.createPlainLiteral("alternativeName_value")));

        String jsonDocument = new ModelToIndexMapper("compositionType").createIndexDocument(model, placeXuri1);

        Assert.assertThat(jsonDocument, sameJSONAs(""
                + "{"
                + "  \"uri\": \"" + placeXuri1.getUri() + "\","
                + "  \"prefLabel\": \"Opera\","
                + "  \"alternativeName\": \"alternativeName_value\","
                + "  \"specification\": \"Not over before the fat lady sings\","
                + "  \"displayLine1\": \"Opera (Not over before the fat lady sings)\""
                + "}").allowingAnyArrayOrdering());
    }
}
