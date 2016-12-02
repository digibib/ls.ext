package no.deichman.services.search;

import com.google.common.collect.ImmutableMap;
import no.deichman.services.entity.EntityType;
import no.deichman.services.uridefaults.BaseURI;
import no.deichman.services.uridefaults.XURI;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ResourceFactory;
import org.apache.jena.vocabulary.RDF;

import java.util.Map;

import static no.deichman.services.entity.EntityType.PLACE;

/**
 * Responsibility: provide common test data setup utilities to index mapping tests.
 */
@SuppressWarnings("checkstyle:ParameterNumber")
public class ModelToIndexMapperTestSupport {

    private final XURI placeUri = new XURI(BaseURI.root(), PLACE.getPath(), "p00000121");
    private final XURI corporationUri = new XURI(BaseURI.root(), EntityType.CORPORATION.getPath(), "c00000121");
    private Map<String, XURI> uris = ImmutableMap.of("Corporation", corporationUri, "Place", placeUri);
    private String placePrefLabel = "Oslo";
    private String placeAlternativeName = "Tigerstaden";
    private String publishedByName = "Gyldenhough";
    private String publishedByAlternativeName = "Aschedal";

    public ModelToIndexMapperTestSupport() throws Exception {
    }

    protected final void addPlaceToModel(boolean withAlternativePlaceName, XURI uriOfThingWithPlace, Model model) throws Exception {
        addThingToModel(withAlternativePlaceName, uriOfThingWithPlace, model, "Place", "place", placePrefLabel, placeAlternativeName, "prefLabel");
    }

    protected final void addPublishedByToModel(boolean withAlternativePlaceName, XURI uriOfThingThatHasPublisher, Model model) throws Exception {
        addThingToModel(withAlternativePlaceName, uriOfThingThatHasPublisher, model, "Corporation", "publishedBy", publishedByName, publishedByAlternativeName, "name");
        addPlaceToModel(withAlternativePlaceName, corporationUri, model);
    }

    protected final void addThingToModel(boolean withAlternativePlaceName, XURI uriOfMotherThing, Model model, String thingType,
                                         String predicate, String thingName, String thingAlternativeName, String namePredicate) {
        String uri = uris.get(thingType).getUri();
        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(uri),
                RDF.type,
                ResourceFactory.createResource(BaseURI.ontology(thingType))));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(uri),
                ResourceFactory.createProperty(BaseURI.ontology(namePredicate)),
                ResourceFactory.createPlainLiteral(thingName)));

        if (withAlternativePlaceName) {
            model.add(ResourceFactory.createStatement(
                    ResourceFactory.createResource(uri),
                    ResourceFactory.createProperty(BaseURI.ontology("alternativeName")),
                    ResourceFactory.createPlainLiteral(thingAlternativeName)));
        }
        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(uriOfMotherThing.getUri()),
                ResourceFactory.createProperty(BaseURI.ontology(predicate)),
                ResourceFactory.createResource(uri)));
    }

    public final String getPublishedByAlternativeName() {
        return publishedByAlternativeName;
    }

    public final String getPlaceAlternativeName() {
        return placeAlternativeName;
    }

    public final String getPlacePrefLabel() {
        return placePrefLabel;
    }

    public final String getPublishedByName() {
        return publishedByName;
    }
}
