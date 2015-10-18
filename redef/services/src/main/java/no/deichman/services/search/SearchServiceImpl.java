package no.deichman.services.search;

import com.google.gson.Gson;
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
import org.apache.jena.rdf.model.Model;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.ServerErrorException;
import javax.ws.rs.core.Response;
import java.net.URISyntaxException;
import java.net.URLEncoder;
import java.nio.charset.Charset;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Responsibility: perform indexing and searching.
 */
public class SearchServiceImpl implements SearchService {
    private static final Logger LOG = LoggerFactory.getLogger(SearchServiceImpl.class);
    private static final String UTF_8 = "UTF-8";
    private URIBuilder workSearchUriBuilder;


    public SearchServiceImpl(String elasticSearchBaseUrl) {
        try {
            workSearchUriBuilder = new URIBuilder(elasticSearchBaseUrl).setPath("/search/work/_search");
        } catch (URISyntaxException e) {
            LOG.error("Failed to create uri builder for elasticsearch");
            throw new RuntimeException(e);
        }

    }

    @Override
    public final void indexWorkModel(Model workModel) {
        QueryExecution queryExecution = QueryExecutionFactory.create(QueryFactory.create(
                        String.format("PREFIX  deichman: <%1$s> \n"
                                + "select distinct ?workUri ?workName ?workYear ?creatorName\n"
                                + "where {\n"
                                + "    ?workUri a deichman:Work ;\n"
                                + "             deichman:name ?workName ;\n"
                                + "             deichman:year ?workYear.\n"
                                + "    optional { \n"
                                + "             ?workUri deichman:creator ?creator .\n"
                                + "             ?creator a deichman:Person ;\n"
                                + "                      deichman:name ?creatorName.\n"
                                + "    }                       \n"
                                + "}\n", BaseURI.remote().ontology())),
                workModel);
        ResultSet resultSet = queryExecution.execSelect();
        if (resultSet.hasNext()) {
            Map<String, String> result = new HashMap<>();
            QuerySolution querySolution = resultSet.nextSolution();
            String workUri = querySolution.get("workUri").asNode().getURI();
            result.put("uri", workUri);

            Optional.ofNullable(querySolution.getLiteral("workName")).ifPresent(literal -> {
                result.put("name", literal.getString());
            });

            Optional.ofNullable(querySolution.getLiteral("workYear")).ifPresent(literal -> {
                result.put("year", literal.getString());
            });

            Optional.ofNullable(querySolution.getLiteral("creatorName")).ifPresent(literal -> {
                result.put("creator", literal.getString());
            });
            try (CloseableHttpClient httpclient = HttpClients.createDefault()) {
                HttpPut httpPut = new HttpPut(workSearchUriBuilder.setPath("/search/work/" + URLEncoder.encode(workUri, UTF_8)).build());
                httpPut.setEntity(new StringEntity(new Gson().toJson(result), Charset.forName(UTF_8)));
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
    public final Response search(String query) {
        try (CloseableHttpClient httpclient = HttpClients.createDefault()) {
            HttpGet httpget = new HttpGet(workSearchUriBuilder.setParameter("q", query).build());
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
}
