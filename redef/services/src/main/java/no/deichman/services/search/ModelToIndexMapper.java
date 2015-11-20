package no.deichman.services.search;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.query.ResultSet;
import org.apache.jena.rdf.model.AnonId;
import org.apache.jena.rdf.model.Literal;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.RDFVisitor;
import org.apache.jena.rdf.model.Resource;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static com.google.common.collect.Maps.newHashMap;
import static java.util.Optional.empty;
import static java.util.Optional.of;
import static java.util.Optional.ofNullable;

/**
 * Responsibility: Map between RDF models and index documents.
 */
public final class ModelToIndexMapper {
    private String type;
    private final String query;
    private final Map<String, String> resultVarToJsonPaths;
    private String groupingResultVariable;

    private static final RDFVisitor RDF_VISITOR = new RDFVisitor() {
        @Override
        public Object visitBlank(Resource r, AnonId id) {
            return null;
        }

        @Override
        public Object visitURI(Resource r, String uri) {
            return uri;
        }

        @Override
        public Object visitLiteral(Literal l) {
            return l.getString();
        }
    };

    private static final Gson GSON = new GsonBuilder().setPrettyPrinting().create();

    private ModelToIndexMapper(String type, String query, Map<String, String> resultVarToJsonPaths, String groupingResultVariable) {
        this.type = type;
        this.query = query;
        this.resultVarToJsonPaths = resultVarToJsonPaths;
        this.groupingResultVariable = groupingResultVariable;
    }

    public Optional<Pair<String, String>> modelToIndexDocument(Model model) {
        QueryExecution queryExecution = QueryExecutionFactory.create(QueryFactory.create(query), model);
        ResultSet resultSet = queryExecution.execSelect();
        if (resultSet.hasNext()) {
            Map<Object, Object> result = new HashMap<>();
            String id = null;
            while (resultSet.hasNext()) {
                QuerySolution querySolution = resultSet.nextSolution();
                id = querySolution.get(type).asNode().getURI();
                resultVarToJsonPaths
                        .forEach((resultVar, nestedElementName) ->
                                ofNullable(querySolution.get(resultVar))
                                        .ifPresent(node ->
                                                putValue(result, nestedElementName, valueOf(node), resultVar.equals(groupingResultVariable))));
            }
            return of(Pair.of(id, GSON.toJson(result)));
        } else {
            return empty();
        }
    }

    private static void putValue(Map<Object, Object> result, String path, Object value, boolean resetGroup) {
        int dotPosition = path.indexOf('.');
        if (!lastElementOfPath(dotPosition)) {
            String thisPathElement = path.substring(0, dotPosition);
            if (!result.containsKey(normalised(thisPathElement))) {
                result.put(normalised(thisPathElement), isArrayElement(thisPathElement) ? new ArrayList() : newHashMap());
            }
            if (isLeafGroupMember(thisPathElement)){
                List list = (List) result.get(normalised(thisPathElement));
                if (resetGroup) {
                    list.add(newHashMap());
                }
                putValue((Map<Object, Object>) list.get(list.size()-1), path.substring(dotPosition + 2), value, resetGroup);
            } else {
                if (isArrayElement(thisPathElement)) {
                    List list = (List) result.get(normalised(thisPathElement));
                    if (resetGroup) {
                        list.add(newHashMap());
                    }
                    putValue((Map<Object, Object>) ((List) result.get(normalised(thisPathElement))).get(list.size()-1), path.substring(dotPosition + 1), value, resetGroup);
                } else {
                    putValue((Map<Object, Object>) result.get(normalised(thisPathElement)), path.substring(dotPosition + 1), value, resetGroup);
                }
            }
        } else {
            result.put(normalised(path), value);
        }
    }

    private static boolean isLeafGroupMember(String thisPathElement) {
        return thisPathElement.startsWith("#");
    }

    private static boolean isArrayElement(String thisPathElement) {
        return thisPathElement.endsWith("#");
    }

    private static String normalised(String thisPathElement) {
        return thisPathElement.replace("#", "");
    }

    private static boolean lastElementOfPath(int dotPosition) {
        return dotPosition == -1;
    }

    private static String valueOf(RDFNode node) {
        return node.visitWith(RDF_VISITOR).toString();
    }

    /**
     * Responsibility: Provide an easy to use builder that makes client code more easy to read.
     */
    public static final class ModelToIndexMapperBuilder {
        private String type;
        private String query;
        private String resultVar;
        private Map<String, String> resultVarToJsonPaths = new HashMap<>();
        private String groupingResultVariable;
        private String arrayPath;

        private ModelToIndexMapperBuilder() {
        }

        public static ModelToIndexMapperBuilder modelToIndexMapperBuilder() {
            return new ModelToIndexMapperBuilder();
        }

        public ModelToIndexMapperBuilder targetIndexType(String type) {
            this.type = type;
            return this;
        }

        public ModelToIndexMapperBuilder selectQuery(String query) {
            this.query = query;
            return this;
        }

        public ModelToIndexMapperBuilder mapFromResultVar(String resultVar) {
            this.resultVar = resultVar;
            return this;
        }

        public ModelToIndexMapperBuilder toJsonPath(String jsonPath) {
            if (!jsonPath.matches("[$_A-Za-z][$_A-Za-z0-9\\.]*")) {
                throw new IllegalArgumentException("Illegal characters in jsonPath");
            }
            addJsonPath(jsonPath);
            return this;
        }

        private void addJsonPath(String jsonPath) {
            if (resultVar == null) {
                throw new IllegalArgumentException("Missing resultVar for JSON path destination " + jsonPath);
            }
            resultVarToJsonPaths.put(resultVar, jsonPath);
            resultVar = null;
        }

        public ModelToIndexMapperBuilder arrayGroupBy(String groupingResultVariable) {
            this.groupingResultVariable = groupingResultVariable;
            return this;
        }

        public ModelToIndexMapperBuilder toJsonObjectArray(String arrayPath) {
            this.arrayPath = arrayPath;
            return this;
        }

        public ModelToIndexMapper build() {
            if (type == null) {
                throw new IllegalArgumentException("Missing index type");
            }
            if (query == null) {
                throw new IllegalArgumentException("Missing select query");
            }
            return new ModelToIndexMapper(type, query, resultVarToJsonPaths, groupingResultVariable);
        }

        public ModelToIndexMapperBuilder withObjectMember(String arrayMemberField) {
            if (arrayPath == null) {
                throw new IllegalArgumentException("Missing arrayPath for array member field " + arrayMemberField);
            }
            addJsonPath(arrayPath + "#.#" + arrayMemberField);
            arrayPath = null;
            return this;
        }
    }
}
