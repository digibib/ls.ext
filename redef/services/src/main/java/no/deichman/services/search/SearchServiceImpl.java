package no.deichman.services.search;

import com.google.gson.Gson;
import no.deichman.services.rdf.JSONLDCreator;
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
                        "PREFIX  deichman: <"+ BaseURI.remote().ontology() + "> \n"
                                + "PREFIX  ui: <"+BaseURI.remote().ui() + ">\n"
                                + "\n"
                                + "construct { \n"
                                + "     ?workUri a ?class ;\n"
                                + "              ui:creatorString ?name ;\n"
                                + "              deichman:name ?title;\n"
                                + "              deichman:year ?year.\n"
                                + "      } \n"
                                + "WHERE {    \n"
                                + "   ?workUri a ?class ;\n"
                                + "            deichman:name ?title ;\n"
                                + "            deichman:creator ?c .\n"
                                + "   optional { ?workUri deichman:year ?year }\n"
                                + "   ?c a deichman:Person ;           \n"
                                + "        deichman:name ?name    \n"
                                + "}\n"),
                workModel);
        Model newWorkModel = queryExecution.execConstruct();

        if (!newWorkModel.isEmpty()) {
            Map<String, String> name = new HashMap<>();
            name.put("@type", "langString");
            name.put("@id", "deichman:name");

            Map<String, String> creatorString = new HashMap<>();
            creatorString.put("@type", "langString");
            creatorString.put("@id", "ui:creatorString");

            Map<String, String> year = new HashMap<>();
            year.put("@type", "gYear");
            year.put("@id", "deichman:year");


            Map<String, Object> context = new HashMap<>();

            context.put("deichman", BaseURI.remote().ontology());
            context.put("ui", BaseURI.remote().ui());
            context.put("gYear", "http://www.w3.org/2001/XMLSchema#gYear");
            context.put("langString", "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString");
            context.put("Work", "deichman:Work");
            context.put("creator", creatorString);
            context.put("year", year);
            context.put("uri", "ui:workUri");
            context.put("name", name);
            JSONLDCreator jsonldCreator = new JSONLDCreator();

            String result = jsonldCreator.asJSONLD(newWorkModel, context);
            HashMap fromJson = new Gson().fromJson(result, HashMap.class);
            fromJson.remove("@context");
            String workUri = (String) fromJson.get("@id");
            fromJson.put("uri", workUri);
            fromJson.remove("@id");
            fromJson.put("type", fromJson.get("@type"));
            fromJson.remove("@type");

            try (CloseableHttpClient httpclient = HttpClients.createDefault()) {
                HttpPut httpPut = new HttpPut(workSearchUriBuilder.setPath("/search/work/" + URLEncoder.encode(workUri, UTF_8)).build());
                httpPut.setEntity(new StringEntity(new Gson().toJson(fromJson), Charset.forName(UTF_8)));
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
