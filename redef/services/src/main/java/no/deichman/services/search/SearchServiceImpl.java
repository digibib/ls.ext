package no.deichman.services.search;

import com.google.common.collect.ImmutableMap;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import no.deichman.services.uridefaults.BaseURI;
import org.apache.commons.io.IOUtils;
import org.apache.http.Header;
import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.ServerErrorException;
import javax.ws.rs.core.Response;
import java.net.URISyntaxException;
import java.net.URLEncoder;
import java.nio.charset.Charset;
import java.util.HashMap;
import java.util.Map;

import static com.google.common.collect.ImmutableMap.of;
import static com.google.common.collect.Maps.newHashMap;
import static java.util.Optional.ofNullable;

/**
 * Responsibility: perform indexing and searching.
 */
public class SearchServiceImpl implements SearchService {
    private static final Logger LOG = LoggerFactory.getLogger(SearchServiceImpl.class);
    private static final String UTF_8 = "UTF-8";
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
    private static final String WORK_MODEL_TO_INDEX_DOCUMENT_QUERY = String.format("PREFIX  : <%1$s> \n"
            + "select distinct ?work ?workName ?workYear ?creatorName ?creator ?birth ?death\n"
            + "where {\n"
            + "    ?work a :Work ;\n"
            + "             :name ?workName ;\n"
            + "             :year ?workYear.\n"
            + "    optional { \n"
            + "             ?work :creator ?creator .\n"
            + "             ?creator a :Person ;\n"
            + "                      :name ?creatorName.\n"
            + "             optional {?creator :birth ?birth.}\n"
            + "             optional {?creator :death ?death.}\n"
            + "    }\n"
            + "}\n", BaseURI.remote().ontology());

    private static final String PERSON_MODEL_TO_INDEX_DOCUMENT_QUERY = String.format("PREFIX  : <%1$s> \n"
            + "select distinct ?person ?personName ?birth ?death\n"
            + "where {\n"
            + "    ?person a :Person ;\n"
            + "             :name ?personName .\n"
            + "    optional {?person :birth ?birth.}\n"
            + "    optional {?person :death ?death.}\n"
            + "}\n", BaseURI.remote().ontology());

    private static final ImmutableMap<String, String> WORK_MODEL_TO_INDEX_DOCUMENT_MAPPING = new ImmutableMap.Builder<String, String>()
            .putAll(of("work", "work.uri", "workName", "work.name", "workYear", "work.year"))
            .putAll(of("creatorName", "work.creator.name", "creator", "work.creator.uri"))
            .putAll(of("birth", "work.creator.birth", "death", "work.creator.death"))
            .build();

    private static final ImmutableMap<String, String> PERSON_MODEL_TO_INDEX_DOCUMENT_MAPPING = of(
            "person", "person.uri", "personName", "person.name", "birth", "person.birth", "death", "person.death"
    );

    public static final String WORK_INDEX_TYPE = "work";
    public static final String PERSON_INDEX_TYPE = "person";
    private URIBuilder workSearchUriBuilder;
    private URIBuilder personSearchUriBuilder;


    public SearchServiceImpl(String elasticSearchBaseUrl) {
        try {
            workSearchUriBuilder = new URIBuilder(elasticSearchBaseUrl).setPath("/search/work/_search");
            personSearchUriBuilder = new URIBuilder(elasticSearchBaseUrl).setPath("/search/person/_search");
        } catch (URISyntaxException e) {
            LOG.error("Failed to create uri builder for elasticsearch");
            throw new RuntimeException(e);
        }

    }

    @Override
    public final void indexWorkModel(Model workModel) {
        indexModel(workModel, WORK_MODEL_TO_INDEX_DOCUMENT_QUERY, WORK_INDEX_TYPE, WORK_MODEL_TO_INDEX_DOCUMENT_MAPPING);
    }

    @Override
    public final void indexPersonModel(Model m) {
        indexModel(m, PERSON_MODEL_TO_INDEX_DOCUMENT_QUERY, PERSON_INDEX_TYPE, PERSON_MODEL_TO_INDEX_DOCUMENT_MAPPING);
    }

    private void indexModel(Model model, String selectQuery, final String type, ImmutableMap<String, String> queryResultToJsonMapping) {
        QueryExecution queryExecution = QueryExecutionFactory.create(QueryFactory.create(selectQuery), model);
        ResultSet resultSet = queryExecution.execSelect();
        if (resultSet.hasNext()) {
            Map<String, Object> result = new HashMap<>();
            QuerySolution querySolution = resultSet.nextSolution();
            String workUri = querySolution.get(type).asNode().getURI();
            queryResultToJsonMapping
                    .forEach((resultVar, nestedElementName) -> {
                        ofNullable(querySolution.get(resultVar)).ifPresent(node -> {
                            putValue(result, nestedElementName, valueOf(node));
                        });
                    });
            try (CloseableHttpClient httpclient = HttpClients.createDefault()) {
                HttpPut httpPut = new HttpPut(workSearchUriBuilder.setPath("/search/" + type + "/" + URLEncoder.encode(workUri, UTF_8)).build());
                httpPut.setEntity(new StringEntity(GSON.toJson(result), Charset.forName(UTF_8)));
                try (CloseableHttpResponse putResponse = httpclient.execute(httpPut)) {
                    LOG.debug(putResponse.getStatusLine().toString());
                }
            } catch (Exception e) {
                LOG.error(String.format("Failed to index %s in elasticsearch", workUri), e);
                throw new ServerErrorException(e.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
            }
        }
    }

    @Override
    public final Response searchWork(String query) {
        return doSearch(query, workSearchUriBuilder);
    }

    @Override
    public final Response searchPerson(String query) {
        return doSearch(query, personSearchUriBuilder);
    }


    private Response doSearch(String query, URIBuilder searchUriBuilder) {
        try (CloseableHttpClient httpclient = HttpClients.createDefault()) {
            HttpGet httpget = new HttpGet(searchUriBuilder.setParameter("q", query).build());
            try (CloseableHttpResponse response = httpclient.execute(httpget)) {
                HttpEntity responseEntity = response.getEntity();
                String jsonContent = IOUtils.toString(responseEntity.getContent());
                Response.ResponseBuilder responseBuilder = Response.ok(jsonContent);
                Header[] headers = response.getAllHeaders();
                for (Header header : headers) {
                    responseBuilder = responseBuilder.header(header.getName(), header.getValue());
                }
                return responseBuilder.build();
            }
        } catch (Exception e) {
            LOG.error(e.getMessage(), e);
            throw new ServerErrorException(e.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }


    private void putValue(Map<String, Object> result, String path, String value) {
        int dotPosition = path.indexOf('.');
        if (!lastElementOfPath(dotPosition)) {
            String thisPathElement = path.substring(0, dotPosition);
            if (!result.containsKey(thisPathElement)) {
                result.put(thisPathElement, newHashMap());
            }
            putValue((Map<String, Object>) result.get(thisPathElement), path.substring(dotPosition + 1), value);
        } else {
            result.put(path, value);
        }
    }

    private boolean lastElementOfPath(int dotPosition) {
        return dotPosition == -1;
    }

    private String valueOf(RDFNode node) {
        return node.visitWith(RDF_VISITOR).toString();
    }

}
