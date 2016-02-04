package no.deichman.services.search;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import org.apache.commons.collections4.map.ListOrderedMap;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.jena.ext.com.google.common.collect.ImmutableMap;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.query.ResultSet;
import org.apache.jena.rdf.model.AnonId;
import org.apache.jena.rdf.model.Literal;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Resource;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static com.google.common.collect.Lists.newArrayList;
import static com.google.common.collect.Maps.newHashMap;
import static java.util.Optional.empty;
import static java.util.Optional.of;
import static java.util.Optional.ofNullable;
import static no.deichman.services.uridefaults.BaseURI.remote;

/**
 * Responsibility: Map between RDF models and index documents.
 */
public final class ModelToIndexMapper {
    private static final String LANGUAGE_AWARE_POSTFIX = "#__lang__";
    private static final String SUFFIX_STRING_ARRAY = "__toStringArray";
    private final String groupConcatConcatenator;
    private String type;
    private final String query;
    private final Map<String, String> resultVarToJsonPaths;
    private String groupingResultVariable;
    public static final Pattern VALUE_WITH_LANGUAGE_TAG_PATTERN = Pattern.compile("^(.+)@(.+)$");

    /**
     * Responsibility: provide an impelemntation of RDFVisitor to extract data from RDF nodes.
     */
    private abstract static class RDFVisitor implements org.apache.jena.rdf.model.RDFVisitor {
        @Override
        public Object visitBlank(Resource r, AnonId id) {
            return null;
        }

        @Override
        public Object visitURI(Resource r, String uri) {
            return uri;
        }
    }

    private static final RDFVisitor RDF_VALUE_VISITOR = new RDFVisitor() {
        @Override
        public Object visitLiteral(Literal l) {
            return l.getString();
        }
    };

    private static final RDFVisitor RDF_LANGUAGE_VISITOR = new RDFVisitor() {
        @Override
        public Object visitLiteral(Literal l) {
            return l.getLanguage();
        }
    };

    private static final Gson GSON = new GsonBuilder().setPrettyPrinting().create();

    private ModelToIndexMapper(String type, String query, Map<String, String> resultVarToJsonPaths, String groupingResultVariable, String groupConcatConcatenator) {
        this.type = type;
        this.query = query;
        this.resultVarToJsonPaths = resultVarToJsonPaths;
        this.groupingResultVariable = groupingResultVariable;
        this.groupConcatConcatenator = groupConcatConcatenator;
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
                        .forEach((resultVar, nestedElementName) -> {
                            ofNullable(querySolution.get(resultVar))
                                    .ifPresent(node -> {
                                        String nodeValue = valueOf(node);
                                        if (nestedElementName.endsWith(LANGUAGE_AWARE_POSTFIX)) {
                                            nodeValue = nodeValue.replaceAll("@$", "@default");
                                        }
                                        if (!nodeValue.isEmpty()) {
                                            putValue(result, nestedElementName, nodeValue, resultVar.equals(groupingResultVariable));
                                        }
                                    });
                        });
            }
            expandLanguageLeafs(result);
            expandArrayLeafs(result);
            return of(Pair.of(id, GSON.toJson(result).replace(SUFFIX_STRING_ARRAY, "")));
        } else {
            return empty();
        }
    }

    private void expandArrayLeafs(Map<Object, Object> result) {
        for (Map.Entry<Object, Object> entry : result.entrySet()) {
            Object entryValue = entry.getValue();
            if (entryValue instanceof Map) {
                ModelToIndexMapper.this.expandArrayLeafs((Map<Object, Object>) entryValue);
            } else if (entryValue instanceof List) {
                for (Object next : ((List) entryValue)) {
                    if (next instanceof Map) {
                        expandArrayLeafs((Map<Object, Object>) next);
                    }
                }
            } else {
                if (entry.getKey().toString().endsWith(SUFFIX_STRING_ARRAY)) {
                    for (String arrayMemberValue : new HashSet<String>(Arrays.asList(StringUtils.split(entryValue.toString(), groupConcatConcatenator)))) {
                        if (entry.getValue() instanceof List) {
                            ((List) entry.getValue()).add(arrayMemberValue);
                        } else {
                            entry.setValue(newArrayList(arrayMemberValue));
                        }
                    }

                }
            }
        }
    }

    private void expandLanguageLeafs(Map<Object, Object> result) {
        for (Map.Entry<Object, Object> entry : result.entrySet()) {
            Object entryValue = entry.getValue();
            if (entryValue instanceof Map) {
                ModelToIndexMapper.this.expandLanguageLeafs((Map<Object, Object>) entryValue);
            } else if (entryValue instanceof List) {
                for (Object next : ((List) entryValue)) {
                    if (next instanceof Map) {
                        expandLanguageLeafs((Map<Object, Object>) next);
                    }
                }
            } else {
                for (String leafValue : StringUtils.split(entryValue.toString(), groupConcatConcatenator)) {
                    Matcher matcher = VALUE_WITH_LANGUAGE_TAG_PATTERN.matcher(leafValue);
                    if (matcher.matches()) {
                        String text = matcher.group(1);
                        String language = matcher.group(2);
                        if (entry.getValue() instanceof Map) {
                            ((Map) entry.getValue()).put(language, text);
                        } else {
                            entry.setValue(newHashMap(ImmutableMap.of(language, text)));
                        }
                    }
                }
            }
        }
    }

    private static void putValue(Map<Object, Object> result, String path, Object value, boolean resetGroup) {
        int dotPosition = path.indexOf('.');
        if (!lastElementOfPath(dotPosition)) {
            String thisPathElement = path.substring(0, dotPosition);
            if (!result.containsKey(normalised(thisPathElement))) {
                result.put(normalised(thisPathElement), isArrayElement(thisPathElement) ? new ArrayList() : newHashMap());
            }
            if (isLeafGroupMember(thisPathElement)) {
                List list = (List) result.get(normalised(thisPathElement));
                if (resetGroup) {
                    list.add(newHashMap());
                }
                putValue((Map<Object, Object>) list.get(list.size() - 1), path.substring(dotPosition + 2), value, resetGroup);
            } else {
                if (isArrayElement(thisPathElement)) {
                    List list = (List) result.get(normalised(thisPathElement));
                    if (resetGroup || list.isEmpty()) {
                        list.add(newHashMap());
                    }
                    putValue((Map<Object, Object>) ((List) result.get(normalised(thisPathElement))).get(list.size() - 1), path.substring(dotPosition + 1), value, resetGroup);
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
        return thisPathElement.replace("#__lang__", "").replace("#", "");
    }

    private static boolean lastElementOfPath(int dotPosition) {
        return dotPosition == -1;
    }

    private static String valueOf(RDFNode node) {
        return node.visitWith(RDF_VALUE_VISITOR).toString();
    }

    private static String languageOf(RDFNode node) {
        return node.visitWith(RDF_LANGUAGE_VISITOR).toString();
    }

    /**
     * Responsibility: Provide an easy to use builder that makes client code more easy to read.
     */
    public static final class ModelToIndexMapperBuilder {
        private String ontologyPrefix = remote().ontology();
        private String type;
        private String query;
        private String resultVar;
        private Map<String, String> resultVarToJsonPaths = new ListOrderedMap<>();
        private String groupingResultVariable;
        private String arrayPath;
        private String groupConcatConcatenator = "|";

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

        public ModelToIndexMapperBuilder toJsonStringArray(String jsonPath) {
            if (!jsonPath.matches("[$_A-Za-z][$_A-Za-z0-9\\.]*")) {
                throw new IllegalArgumentException("Illegal characters in jsonPath");
            }
            addJsonPath(jsonPath + "#" + SUFFIX_STRING_ARRAY);
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
            return new ModelToIndexMapper(type, String.format(query, ontologyPrefix), resultVarToJsonPaths, groupingResultVariable, groupConcatConcatenator);
        }

        public ModelToIndexMapperBuilder withObjectMember(String arrayMemberField) {
            if (arrayPath == null) {
                throw new IllegalArgumentException("Missing arrayPath for array member field " + arrayMemberField);
            }
            addJsonPath(arrayPath + "#.#" + arrayMemberField);
            arrayPath = null;
            return this;
        }

        public ModelToIndexMapperBuilder withLanguageSpecifiedObjectMember(String arrayMemberField) {
            return withObjectMember(arrayMemberField + LANGUAGE_AWARE_POSTFIX);
        }

        public ModelToIndexMapperBuilder withGroupConcatenator(String groupConcatConcatenator) {
            this.groupConcatConcatenator = groupConcatConcatenator;
            return this;
        }

        public ModelToIndexMapperBuilder toLanguageSpecifiedJsonPath(String jsonPath) {
            addJsonPath(jsonPath + LANGUAGE_AWARE_POSTFIX);
            return this;
        }

        public ModelToIndexMapperBuilder withOntologyPrefix(String prefix) {
            this.ontologyPrefix = prefix;
            return this;
        }
    }
}
