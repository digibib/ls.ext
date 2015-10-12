package no.deichman.services.search;

import com.google.gson.Gson;
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
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.impl.PropertyImpl;
import org.apache.jena.rdf.model.impl.ResourceImpl;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.riot.RDFFormat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.ServerErrorException;
import javax.ws.rs.core.Response;
import java.io.StringWriter;
import java.io.UnsupportedEncodingException;
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
    public final void indexWorkModel(Model m) {
        String year = m.listStatements(new ResourceImpl("http://127.0.0.1:55051/work/w278995271697"),
                new PropertyImpl("deichman:year"), ((RDFNode) null)).nextStatement().getString();
        StringWriter jsonContent = new StringWriter();
        RDFDataMgr.write(jsonContent, m, RDFFormat.JSONLD);
        Map jsonMap = new Gson().fromJson(jsonContent.toString(), HashMap.class);
        jsonMap.remove("@context");
        String encodedWorkId;
        try {
            encodedWorkId = URLEncoder.encode(jsonMap.get("@id").toString(), UTF_8);
        } catch (UnsupportedEncodingException e) {
            LOG.error(e.getMessage(), e);
            return;
        }
        String newJsonContent = new Gson().toJson(jsonMap);
        try (CloseableHttpClient httpclient = HttpClients.createDefault()) {
            HttpPut httpPut = new HttpPut(workSearchUriBuilder.setPath("/search/work/" + encodedWorkId).build());
            httpPut.setEntity(new StringEntity(newJsonContent, Charset.forName(UTF_8)));
            try (CloseableHttpResponse putResponse = httpclient.execute(httpPut)) {
                LOG.debug(putResponse.getStatusLine().toString());
            }
        }  catch (Exception e) {
            LOG.error(String.format("Failed to index %s in elasticsearch", encodedWorkId), e);
            throw new ServerErrorException(e.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
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
