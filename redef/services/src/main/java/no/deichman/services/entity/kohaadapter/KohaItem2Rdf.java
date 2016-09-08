package no.deichman.services.entity.kohaadapter;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;
import no.deichman.services.uridefaults.BaseURI;
import no.deichman.services.utils.ResourceReader;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.vocabulary.XSD;

import java.lang.reflect.Type;
import java.util.Map;

import static org.apache.jena.rdf.model.ResourceFactory.createPlainLiteral;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.apache.jena.rdf.model.ResourceFactory.createStatement;

/**
 * Responsibility: Maps Koha item data to an RDF model.
 */
public final class KohaItem2Rdf {

    private static final String DEICHMAN_NS_EXEMPLAR = "http://deichman.no/exemplar/";
    private static final String RDF_SYNTAX_NS_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
    private static final String DEICHMAN_ITEM = "Item";
    private static final String DEICHMAN_STATUS = "status";
    private static final String DEICHMAN_LOCATION = "location";
    private static final String DEICHMAN_BRANCH = "branch";
    private static final String DEICHMAN_BARCODE = "barcode";
    private static final String DUO_SHELFMARK = "shelfmark";
    private static final String DUO_NS = "http://data.deichman.no/utility#";


    public KohaItem2Rdf() {

    }

    private Map<String, String> readBranchesJson() {
        Type type = new TypeToken<Map<String, String>>(){}.getRawType();
        return new Gson().fromJson(new ResourceReader().readFile("branches.json"), type);
    }

    private String getBranch(String code) {
        Map<String, String> branches = readBranchesJson();
        return branches.containsKey(code) ? branches.get(code) : code;
    }

    private void safeAddTriple(Model m, String key, Resource subj, String predicate, JsonObject itemData) {
        if (itemData.has(key) && !itemData.get(key).isJsonNull()) {
            m.add(
                    createStatement(
                            subj,
                            createProperty(predicate),
                            createPlainLiteral(itemData.get(key).getAsString())
                    )
            );
        }
    }
    public Model mapItemsToModel(JsonArray items) {

        Model model = ModelFactory.createDefaultModel();

        model.setNsPrefix("", DEICHMAN_NS_EXEMPLAR);
        model.setNsPrefix("duo", DUO_NS);
        model.setNsPrefix("xsd", XSD.getURI());

        items.forEach(item -> {

            JsonObject itemData = item.getAsJsonObject();

            Resource subject = createResource(BaseURI.exemplar() + "e" + itemData.get("barcode").getAsString());
            String ontologyNS = BaseURI.ontology();

            model.add(
                    createStatement(
                            subject,
                            createProperty(RDF_SYNTAX_NS_TYPE),
                            createResource(ontologyNS + DEICHMAN_ITEM)
                    )
            );

            if (itemData.has("holdingbranch") && !itemData.get("holdingbranch").isJsonNull()) {
                model.add(
                        createStatement(
                                subject,
                                createProperty(ontologyNS + DEICHMAN_BRANCH),
                                createPlainLiteral(getBranch(itemData.get("holdingbranch").getAsString()))
                        )
                );
            }

            safeAddTriple(model, "status", subject, ontologyNS + DEICHMAN_STATUS, itemData);
            safeAddTriple(model, "location", subject, ontologyNS + DEICHMAN_LOCATION, itemData);
            safeAddTriple(model, "barcode", subject, ontologyNS + DEICHMAN_BARCODE, itemData);
            safeAddTriple(model, "itemcallnumber", subject, DUO_NS + DUO_SHELFMARK, itemData);

        });

        return model;
    }

}
