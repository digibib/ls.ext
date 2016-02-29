package no.deichman.services.search;

import com.github.jsonldjava.core.JsonLdError;
import com.github.jsonldjava.core.JsonLdOptions;
import com.github.jsonldjava.core.JsonLdProcessor;
import com.github.jsonldjava.utils.JsonUtils;
import com.google.gson.Gson;
import no.deichman.services.rdf.RDFModelUtil;
import no.deichman.services.uridefaults.BaseURI;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.riot.Lang;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Responsibility: Map models to index documents with a massaging query and a json-ld context.
 */
public class ModelToIndexMapper {
    private String query;
    private Map<String, Object> context;
    private String type;

    public ModelToIndexMapper(String type) {
        this(type, BaseURI.remote());
    }

    public ModelToIndexMapper(String type, BaseURI baseURI) {
        this.type = type;
        String sparqlQueryFilename = "massage_" + type + "_query.sparql";
        try (BufferedReader queryBuffer = new BufferedReader(new InputStreamReader(this.getClass().getClassLoader().getResourceAsStream(sparqlQueryFilename)));) {
            query = queryBuffer.lines().collect(Collectors.joining("\n"));
            query = query.replace("__ONTOLOGY__", baseURI.ontology());
        } catch (IOException | NullPointerException e) {
            throw new RuntimeException("Could not load sparql query file: " + sparqlQueryFilename, e);
        }
        String contextFilename = "massage_" + type + "_context.json";
        try (BufferedReader contextBuffer = new BufferedReader(new InputStreamReader(this.getClass().getClassLoader().getResourceAsStream(contextFilename)))
        ) {
            String contextString = contextBuffer.lines().collect(Collectors.joining("\n")).replace("__ONTOLOGY__", baseURI.ontology());
            context = new Gson().fromJson(contextString, HashMap.class);
        } catch (IOException | NullPointerException e) {
            throw new RuntimeException("Could not load context file: " + contextFilename, e);
        }
    }

    public final String createIndexDocument(Model model, String uri) {
        Model massagedModel = massageModel(model, uri);
        if (massagedModel.isEmpty()) {
            throw new RuntimeException("Massaged model of " + uri + " is empty");
        }
        String json = null;
        try {
            json = applyContext(massagedModel);
        } catch (IOException | JsonLdError e) {
            throw new RuntimeException("Exception raised when applying context to json-ld", e);
        }
        return json;
    }

    private Model massageModel(Model model, String uri) {
        QueryExecution queryExecution = QueryExecutionFactory.create(query.replace("__" + type.toUpperCase() + "URI__", uri), model);
        return queryExecution.execConstruct();
    }

    private String applyContext(Model model) throws IOException, JsonLdError {
        Object json = JsonUtils.fromString(RDFModelUtil.stringFrom(model, Lang.JSONLD));
        JsonLdOptions options = new JsonLdOptions();
        Map<String, Object> framed = JsonLdProcessor.frame(json, context, options);
        Map<String, Object> graph = (Map<String, Object>) ((ArrayList<Object>) framed.get("@graph")).get(0);
        removeType(graph);
        Map<String, Object> root = new HashMap<>();
        root.put(type, graph);
        return new Gson().toJson(root);
    }

    private void removeType(Object input) {
        if (input instanceof Map) {
            Map map = (Map) input;
            map.remove("type");
            map.forEach((key, value) -> removeType(value));
        } else if (input instanceof List) {
            List list = (List) input;
            list.forEach(this::removeType);
        }
    }
}
