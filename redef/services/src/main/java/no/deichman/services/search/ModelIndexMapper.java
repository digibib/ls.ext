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

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static com.google.common.collect.Maps.newHashMap;
import static java.util.Optional.empty;
import static java.util.Optional.of;
import static java.util.Optional.ofNullable;

/**
 * Responsibility: Map between RDF models and index documents.
 */
public final class ModelIndexMapper {
    private ModelIndexMapper() {
    }

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

    public static Optional<Pair<String, String>> modelToIndexDocument(Model model, String selectQuery, final String type, Map<String, String> queryResultToJsonMapping) {
        QueryExecution queryExecution = QueryExecutionFactory.create(QueryFactory.create(selectQuery), model);
        ResultSet resultSet = queryExecution.execSelect();
        if (resultSet.hasNext()) {
            Map<Object, Object> result = new HashMap<>();
            QuerySolution querySolution = resultSet.nextSolution();
            String id = querySolution.get(type).asNode().getURI();
            queryResultToJsonMapping
                    .forEach((resultVar, nestedElementName) ->
                            ofNullable(querySolution.get(resultVar))
                            .ifPresent(node ->
                                    putValue(result, nestedElementName, valueOf(node))));
            return of(Pair.of(id, GSON.toJson(result)));
        }
        return empty();
    }

    private static void putValue(Map<Object, Object> result, String path, String value) {
        int dotPosition = path.indexOf('.');
        if (!lastElementOfPath(dotPosition)) {
            String thisPathElement = path.substring(0, dotPosition);
            if (!result.containsKey(thisPathElement)) {
                result.put(thisPathElement, newHashMap());
            }
            putValue((Map<Object, Object>) result.get(thisPathElement), path.substring(dotPosition + 1), value);
        } else {
            result.put(path, value);
        }
    }

    private static boolean lastElementOfPath(int dotPosition) {
        return dotPosition == -1;
    }

    private static String valueOf(RDFNode node) {
        return node.visitWith(RDF_VISITOR).toString();
    }
}
