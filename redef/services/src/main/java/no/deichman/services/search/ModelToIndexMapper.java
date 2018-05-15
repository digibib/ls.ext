package no.deichman.services.search;

import com.github.jsonldjava.core.JsonLdError;
import com.github.jsonldjava.core.JsonLdOptions;
import com.github.jsonldjava.core.JsonLdProcessor;
import com.github.jsonldjava.utils.JsonUtils;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import no.deichman.services.entity.EntityType;
import no.deichman.services.rdf.RDFModelUtil;
import no.deichman.services.uridefaults.BaseURI;
import no.deichman.services.uridefaults.XURI;
import no.deichman.services.utils.ResourceReader;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.riot.Lang;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Responsibility: Map models to index documents with a massaging query and a json-ld context.
 */
public class ModelToIndexMapper {
    private static final String AGENT = "Agent";
    public static final Gson GSON = new GsonBuilder().create();
    private String query;
    private Map<String, Object> context;
    private String type;
    private Map<String, Object> nodeIndex;

    public ModelToIndexMapper(String type) {
        this.type = type;
        String sparqlQueryFilename = "massage_" + type + "_query.sparql";
        query = new ResourceReader().readFile(sparqlQueryFilename).replace("__ONTOLOGY__", BaseURI.ontology());
        String contextFilename = "massage_" + type + "_context.json";
        context = GSON.fromJson(new ResourceReader().readFile(contextFilename).replace("__ONTOLOGY__", BaseURI.ontology()), HashMap.class);
    }

    public final String createIndexDocument(Model model, XURI xuri) {
        Model massagedModel = massageModel(model, xuri);
        if (massagedModel.isEmpty()) {
            throw new RuntimeException("Massaged model of " + xuri.getUri() + " is empty");
        }
        String json = null;
        try {
            json = GSON.toJson(applyContext(massagedModel, xuri.getTypeAsEntityType()));
        } catch (IOException | JsonLdError e) {
            throw new RuntimeException("Exception raised when applying context to json-ld", e);
        }
        return json;
    }

    public final Map<String, Object> createIndexObject(Model model, XURI xuri) {
        Model massagedModel = massageModel(model, xuri);
        if (massagedModel.isEmpty()) {
            throw new RuntimeException("Massaged model of " + xuri.getUri() + " is empty");
        }
        Map<String, Object> doc = null;
        try {
            doc = applyContext(massagedModel, xuri.getTypeAsEntityType());
        } catch (IOException | JsonLdError e) {
            throw new RuntimeException("Exception raised when applying context to json-ld", e);
        }
        return doc;
    }

    private Model massageModel(Model model, XURI xuri) {
        QueryExecution queryExecution = QueryExecutionFactory.create(query.replaceAll("__" + type.toUpperCase() + "URI__", xuri.getUri()), model);
        return queryExecution.execConstruct();
    }

    private Map<String, Object> applyContext(Model model, EntityType type) throws IOException, JsonLdError {
        Object json = JsonUtils.fromString(RDFModelUtil.stringFrom(model, Lang.JSONLD));
        JsonLdOptions options = new JsonLdOptions();
        options.setEmbed(true);
        Map<String, Object> framed = JsonLdProcessor.frame(json, context, options);
        Map<String, Object> graph = (Map<String, Object>) ((ArrayList<Object>) framed.get("@graph")).get(0);
        nodeIndex = new HashMap<>();
        indexNodes(graph);
        removeTypeAndBnodeIdAndEmbedAllNodes(graph);
        type.addSortingLabels(graph);
        Map<String, Object> root = new HashMap<>();
        root.putAll(graph);
        return root;
    }

    private void indexNodes(Object input) {
        if (input instanceof Map) {
            Map map = (Map) input;
            if (map.containsKey("uri") && map.get("uri").getClass() == String.class && map.get("uri") != null) {
                String uri = (String) map.get("uri");
                if (nodeIndex.get(uri) == null && map.get("type") != null && map.get("type").equals(AGENT)) {
                    nodeIndex.put(uri, map);
                }
            }
            map.forEach((key, value) -> indexNodes(value));
        } else if (input instanceof List) {
            List list = (List) input;
            list.forEach(this::indexNodes);
        }
    }

    private void removeTypeAndBnodeIdAndEmbedAllNodes(Object input) {
        if (input instanceof Map) {
            Map map = (Map) input;
            String uri = (String) map.get("uri");
            if (uri != null && map.get("type") == null && nodeIndex.get(uri) != null) {
                map.putAll((Map) nodeIndex.get(uri));
            }

            map.remove("type");
            if (map.containsKey("uri") && map.get("uri").toString().startsWith("_:")) {
                map.remove("uri");
            }
            map.forEach((key, value) -> removeTypeAndBnodeIdAndEmbedAllNodes(value));
        } else if (input instanceof List) {
            List list = (List) input;
            list.forEach(this::removeTypeAndBnodeIdAndEmbedAllNodes);
        }
    }
}
