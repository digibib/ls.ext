package no.deichman.services.search;

import com.github.jsonldjava.core.JsonLdError;
import com.github.jsonldjava.core.JsonLdOptions;
import com.github.jsonldjava.core.JsonLdProcessor;
import com.github.jsonldjava.utils.JsonUtils;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.jamonapi.Monitor;
import com.jamonapi.MonitorFactory;
import no.deichman.services.rdf.RDFModelUtil;
import no.deichman.services.uridefaults.BaseURI;
import no.deichman.services.uridefaults.XURI;
import no.deichman.services.utils.ResourceReader;
import org.apache.commons.lang3.StringUtils;
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
    public static final Gson GSON = new GsonBuilder().setPrettyPrinting().create();
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
        Monitor mon = MonitorFactory.start("createIndexDocument");
        Model massagedModel = massageModel(model, xuri);
        if (massagedModel.isEmpty()) {
            throw new RuntimeException("Massaged model of " + xuri.getUri() + " is empty");
        }
        String json = null;
        try {
            json = applyContext(massagedModel);
        } catch (IOException | JsonLdError e) {
            throw new RuntimeException("Exception raised when applying context to json-ld", e);
        }
        mon.stop();
        return json;
    }

    private Model massageModel(Model model, XURI xuri) {
        QueryExecution queryExecution = QueryExecutionFactory.create(query.replaceAll("__" + type.toUpperCase() + "URI__", xuri.getUri()), model);
        return queryExecution.execConstruct();
    }

    private String applyContext(Model model) throws IOException, JsonLdError {
        Object json = JsonUtils.fromString(RDFModelUtil.stringFrom(model, Lang.JSONLD));
        JsonLdOptions options = new JsonLdOptions();
        options.setEmbed(true);
        Map<String, Object> framed = JsonLdProcessor.frame(json, context, options);
        Map<String, Object> graph = (Map<String, Object>) ((ArrayList<Object>) framed.get("@graph")).get(0);
        nodeIndex = new HashMap<>();
        indexNodes(graph);
        removeTypeAndBnodeIdAndEmbedAllNodes(graph);
        Map<String, Object> root = new HashMap<>();
        root.putAll(graph);
        return GSON.toJson(root);
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

            if (map.containsKey("type")) {
                String displayLine1 = "";
                String displayLine2 = "";
                switch (map.get("type").toString()) {
                    case "Work":
                        if (map.containsKey("mainEntryName")) {
                            displayLine1 = map.get("mainEntryName").toString()+ ". ";
                        }
                        if (map.containsKey("mainTitle")) {
                            displayLine1 += map.get("mainTitle").toString();
                        }
                        if (map.containsKey("subtitle")) {
                            displayLine1 += " : " +  map.get("subtitle").toString();
                        }
                        if (map.containsKey("partNumber")) {
                            displayLine1 += ". " +  map.get("partNumber").toString();
                        }
                        if (map.containsKey("partTitle")) {
                            displayLine1 += ". " +  map.get("partTitle").toString();
                        }
                        if (map.containsKey("publicationYear")) {
                            displayLine2 += map.get("publicationYear").toString();
                        }
                        if (map.containsKey("workTypeLabel")) {
                            if (displayLine2.length() > 0) {
                                displayLine2 += ". ";
                            }
                            displayLine2 += map.get("workTypeLabel").toString();
                        }
                        if (map.containsKey("litform")) {
                            if (displayLine2.length() > 0) {
                                displayLine2 += ". ";
                            }
                            if (map.get("litform").getClass() == String.class) {
                                displayLine2 += map.get("litform").toString();
                            } else if (map.get("litform").getClass() == ArrayList.class) {
                                displayLine2 += StringUtils.join((ArrayList) map.get("litform"), ", ");
                            }
                           }
                        break;
                    case "Publication":
                        if (map.containsKey("mainEntryName")) {
                            displayLine1 = map.get("mainEntryName").toString()+ ". ";
                        }
                        if (map.containsKey("mainTitle")) {
                            displayLine1 += map.get("mainTitle").toString();
                        }
                        if (map.containsKey("subtitle")) {
                            displayLine1 += " : " +  map.get("subtitle").toString();
                        }
                        if (map.containsKey("partNumber")) {
                            displayLine1 += ". " +  map.get("partNumber").toString();
                        }
                        if (map.containsKey("partTitle")) {
                            displayLine1 += ". " +  map.get("partTitle").toString();
                        }
                        if (map.containsKey("mt") || map.containsKey("format")) {
                            displayLine1 += " (";
                            if (map.containsKey("mt")) {
                                displayLine1 += map.get("mt").toString();
                            }
                            if (map.containsKey("format")) {
                                displayLine1 += ". " + map.get("format").toString();
                            }
                            displayLine1 +=")";
                        }
                        if (map.containsKey("publishedBy")) {
                            displayLine2 += map.get("publishedBy").toString();
                        }
                        if (map.containsKey("publicationYear")) {
                            if (displayLine2.length() > 0) {
                                displayLine2 += ", ";
                            }
                            displayLine2 += map.get("publicationYear");
                        }
                        if (map.containsKey("isbn")) {
                            if (displayLine2.length() > 0) {
                                displayLine2 += ". ";
                            }
                            displayLine2 += "ISBN " + map.get("isbn").toString();
                        }
                        if (map.containsKey("ean")) {
                            if (displayLine2.length() > 0) {
                                displayLine2 += ". ";
                            }
                            displayLine2 += "EAN " + map.get("ean").toString();
                        }
                        if (map.containsKey("recordId")) {
                            if (displayLine2.length() > 0) {
                                displayLine2 += ". ";
                            }
                            displayLine2 += "Tnr: " + map.get("recordId").toString();
                        }
                        break;
                    case "Person":
                        displayLine1 = map.getOrDefault("name", "").toString();
                        if (map.containsKey("ordinal")) {
                            displayLine1 += " " +  map.get("ordinal").toString();
                        }
                        if (map.containsKey("specification")) {
                            displayLine1 += " (" +  map.get("specification").toString() + ")";
                        }
                        if (map.containsKey("birthYear") || map.containsKey("deathYear")) {
                            displayLine1 += ", ";
                            if (map.containsKey("birthYear")) {
                                displayLine1 += map.get("birthYear").toString();
                            }
                            if (map.containsKey("deathYear")) {
                                displayLine1 += "-" +map.get("deathYear").toString();
                            }
                        }
                        if (map.containsKey("nationality")) {
                            if (map.get("nationality").getClass() == String.class) {
                                displayLine2 = map.get("nationality").toString();
                            } else if (map.get("nationality").getClass() == ArrayList.class) {
                                displayLine2 = StringUtils.join((ArrayList) map.get("nationality"), ", ");
                            }
                        }
                        break;
                    case "Corporation":
                        displayLine1 = map.getOrDefault("name", "").toString();
                        if (map.containsKey("subdivision")) {
                            displayLine1 += ". " +  map.get("subdivision").toString();
                        }
                        if (map.containsKey("specification")) {
                            displayLine1 += " (" +  map.get("specification").toString() + ")";
                        }
                        if (map.containsKey("placePrefLabel")) {
                            displayLine1 += ". " +  map.get("placePrefLabel").toString();
                        }
                        break;
                    case "Event":
                        displayLine1 = map.getOrDefault("prefLabel", "").toString();
                        if (map.containsKey("ordinal")) {
                            displayLine1 += " " +  map.get("ordinal").toString();
                        }
                        if (map.containsKey("date")) {
                            displayLine1 += ". " +  map.get("date").toString();
                        }
                        if (map.containsKey("placePrefLabel")) {
                            displayLine1 += ", " +  map.get("placePrefLabel").toString();
                        }
                        if (map.containsKey("placeSpecification")) {
                            displayLine1 += " (" +  map.get("placeSpecification").toString() + ")";
                        }
                              if (map.containsKey("specification")) {
                            displayLine1 += " (" +  map.get("specification").toString() + ")";
                        }
                        break;
                    case "Serial":
                        displayLine1 = map.getOrDefault("serialMainTitle", "").toString();
                        if (map.containsKey("subtitle")) {
                            displayLine1 += " : " +  map.get("subtitle").toString();
                        }
                        if (map.containsKey("partNumber")) {
                            displayLine1 += ". " +  map.get("partNumber").toString();
                        }
                        if (map.containsKey("partTitle")) {
                            displayLine1 += ". " +  map.get("partTitle").toString();
                        }
                        if (map.containsKey("publishedByName")) {
                            displayLine1 += " (" +  map.get("publishedByName").toString() + ")";
                        }
                        break;
                    case "WorkSeries":
                        displayLine1 = map.getOrDefault("workSeriesMainTitle", "").toString();
                        if (map.containsKey("subtitle")) {
                            displayLine1 += " : " +  map.get("subtitle").toString();
                        }
                        if (map.containsKey("partNumber")) {
                            displayLine1 += ". " +  map.get("partNumber").toString();
                        }
                        if (map.containsKey("partTitle")) {
                            displayLine1 += ". " +  map.get("partTitle").toString();
                        }
                        break;
                    case "Subject":
                    case "Genre":
                    case "Instrument":
                    case "CompositionType":
                    case "Place":
                        displayLine1 = map.getOrDefault("prefLabel", "").toString();
                        if (map.containsKey("specification")) {
                            displayLine1 += " (" +  map.get("specification").toString() + ")";
                        }
                        break;
                    default:
                        break;
                }
                if (displayLine1.length() > 0) {
                    map.put("displayLine1", displayLine1);
                }
                if (displayLine2.length() > 0) {
                    map.put("displayLine2", displayLine2);
                }
                map.remove("type");
            }

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
