package no.deichman.services.search;

import no.deichman.services.entity.EntityService;
import no.deichman.services.uridefaults.XURI;
import org.apache.commons.io.IOUtils;
import org.apache.http.Header;
import org.apache.http.HttpEntity;
import org.apache.http.NameValuePair;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.client.methods.HttpRequestBase;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.InputStreamEntity;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.ResIterator;
import org.apache.jena.rdf.model.Statement;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.ServerErrorException;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import static java.lang.String.format;
import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.net.HttpURLConnection.HTTP_OK;
import static java.net.URLEncoder.encode;
import static javax.ws.rs.core.Response.Status.INTERNAL_SERVER_ERROR;
import static no.deichman.services.uridefaults.BaseURI.remote;
import static org.apache.http.impl.client.HttpClients.createDefault;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;

/**
 * Responsibility: perform indexing and searching.
 */
public class SearchServiceImpl implements SearchService {
    public static final Property CREATOR = createProperty(remote().ontology("creator"));
    private static final Logger LOG = LoggerFactory.getLogger(SearchServiceImpl.class);
    private static final String UTF_8 = "UTF-8";
    private final EntityService entityService;
    private final String elasticSearchBaseUrl;
    private ModelToIndexMapper workModelToIndexMapper = new ModelToIndexMapper("work");
    private ModelToIndexMapper publisherModelToIndexMapper = new ModelToIndexMapper("publisher");
    private ModelToIndexMapper placeOfPublicationModelToIndexMapper = new ModelToIndexMapper("placeOfPublication");
    private ModelToIndexMapper personModelToIndexMapper = new ModelToIndexMapper("person");
    private ModelToIndexMapper serialModelToIndexMapper = new ModelToIndexMapper("serial");

    public SearchServiceImpl(String elasticSearchBaseUrl, EntityService entityService) {
        this.elasticSearchBaseUrl = elasticSearchBaseUrl;
        this.entityService = entityService;
        getIndexUriBuilder();
    }

    @Override
    public final void index(XURI xuri) throws Exception {
        switch (xuri.getTypeAsEntityType()) {
            case WORK: doIndexWork(xuri, false);
                break;
            case PERSON: doIndexPerson(xuri, false);
                break;
            case PLACE_OF_PUBLICATION: doIndexPlaceOfPublication(xuri);
                break;
            case PUBLISHER: doIndexPublisher(xuri);
                break;
            case SERIAL: doIndexSerial(xuri);
                break;
            default: break;
        }
    }

    @Override
    public final Response searchPersonWithJson(String json) {
        return searchWithJson(json, getPersonSearchUriBuilder());
    }

    @Override
    public final Response searchWorkWithJson(String json, MultivaluedMap<String, String> queryParams) {
        return searchWithJson(json, getWorkSearchUriBuilder(queryParams));
    }

    @Override
    public final Response clearIndex() {
        try (CloseableHttpClient httpclient = createDefault()) {
            URI uri = getIndexUriBuilder().setPath("/search").build();

            try (CloseableHttpResponse getExistingIndex = httpclient.execute(new HttpGet(uri))) {
                if (getExistingIndex.getStatusLine().getStatusCode() == HTTP_OK) {
                    try (CloseableHttpResponse delete = httpclient.execute(new HttpDelete(uri))) {
                        int statusCode = delete.getStatusLine().getStatusCode();
                        LOG.info("Delete index request returned status " + statusCode);
                        if (statusCode != HTTP_OK) {
                            throw new ServerErrorException("Failed to delete elasticsearch index", HTTP_INTERNAL_ERROR);
                        }
                    }
                }
            }
            try (CloseableHttpResponse create = httpclient.execute(new HttpPut(uri))) {
                int statusCode = create.getStatusLine().getStatusCode();
                LOG.info("Create index request returned status " + statusCode);
                if (statusCode != HTTP_OK) {
                    throw new ServerErrorException("Failed to create elasticsearch index", HTTP_INTERNAL_ERROR);
                }
            }
            putIndexMapping(httpclient, "work");
            putIndexMapping(httpclient, "person");
            putIndexMapping(httpclient, "placeOfPublication");
            putIndexMapping(httpclient, "publisher");
            putIndexMapping(httpclient, "serial");
            return Response.status(Response.Status.OK).build();
        } catch (Exception e) {
            LOG.error(e.getMessage(), e);
            throw new ServerErrorException(e.getMessage(), INTERNAL_SERVER_ERROR);
        }
    }

    private void putIndexMapping(CloseableHttpClient httpclient, String type) throws URISyntaxException, IOException {
        URI workIndexUri = getIndexUriBuilder().setPath("search/_mapping/" + type).build();
        HttpPut putWorkMappingRequest = new HttpPut(workIndexUri);
        putWorkMappingRequest.setEntity(new InputStreamEntity(getClass().getResourceAsStream("/" + type + "_mapping.json"), ContentType.APPLICATION_JSON));
        try (CloseableHttpResponse create = httpclient.execute(putWorkMappingRequest)) {
            int statusCode = create.getStatusLine().getStatusCode();
            LOG.info("Create mapping request for " + type + " returned status " + statusCode);
            if (statusCode != HTTP_OK) {
                throw new ServerErrorException("Failed to create elasticsearch mapping for " + type, HTTP_INTERNAL_ERROR);
            }
        }
    }

    @Override
    public final Response searchPlaceOfPublicationWithJson(String json) {
        return searchWithJson(json, getPlaceOfPublicationUriBuilder());
    }

    private Response searchWithJson(String body, URIBuilder searchUriBuilder) {
        try {
            HttpPost httpPost = new HttpPost(searchUriBuilder.build());
            httpPost.setEntity(new StringEntity(body, StandardCharsets.UTF_8));
            httpPost.setHeader("Content-type", "application/json");
            return executeHttpRequest(httpPost);
        } catch (Exception e) {
            LOG.error(e.getMessage(), e);
            throw new ServerErrorException(e.getMessage(), INTERNAL_SERVER_ERROR);
        }
    }

    private Response executeHttpRequest(HttpRequestBase httpRequestBase) throws IOException {
        try (CloseableHttpClient httpclient = createDefault();
             CloseableHttpResponse response = httpclient.execute(httpRequestBase)) {
            HttpEntity responseEntity = response.getEntity();
            String jsonContent = IOUtils.toString(responseEntity.getContent());
            Response.ResponseBuilder responseBuilder = Response.ok(jsonContent);
            Header[] headers = response.getAllHeaders();
            for (Header header : headers) {
                responseBuilder = responseBuilder.header(header.getName(), header.getValue());
            }
            return responseBuilder.build();
        } catch (Exception e) {
            throw e;
        }
    }

    @Override
    public final Response searchWork(String query) {
        return doSearch(query, getWorkSearchUriBuilder(null));
    }

    @Override
    public final Response searchPerson(String query) {
        return doSearch(query, getPersonSearchUriBuilder());
    }

    @Override
    public final Response searchPlaceOfPublication(String query) {
        return doSearch(query, getPlaceOfPublicationUriBuilder());
    }

    @Override
    public final Response searchPublisher(String query) {
        return doSearch(query, getPublisherSearchUriBuilder());
    }

    @Override
    public final Response searchSerial(String query) {
        return doSearch(query, getSerialSearchUriBuilder());
    }


    private void doIndexWork(XURI xuri, boolean indexedPerson) throws Exception {

        Model workModelWithLinkedResources = entityService.retrieveWorkWithLinkedResources(xuri);
        indexDocument(xuri, workModelToIndexMapper.createIndexDocument(workModelWithLinkedResources, xuri));

        if (!indexedPerson) {
            Statement creatorProperty = workModelWithLinkedResources.getProperty(
                    createResource(xuri.getUri()),
                    CREATOR);
            if (creatorProperty != null) {
                XURI creatorXuri = new XURI(creatorProperty.getObject().asNode().getURI());
                doIndexPersonOnly(creatorXuri);
            }
        }
    }

    private void doIndexPerson(XURI xuri, boolean indexedWork) throws Exception {
        Model works = entityService.retrieveWorksByCreator(xuri);
        if (!indexedWork) {
            ResIterator subjectIterator = works.listSubjects();
            while (subjectIterator.hasNext()) {
                XURI workUri = new XURI(subjectIterator.next().toString());
                doIndexWorkOnly(workUri);
            }
        }
        Model personWithWorksModel = entityService.retrievePersonWithLinkedResources(xuri).add(works);
        indexDocument(xuri, personModelToIndexMapper.createIndexDocument(personWithWorksModel, xuri));
    }

    private void doIndexPlaceOfPublication(XURI xuri) throws Exception {
        Model placeOfPublicationModel = entityService.retrieveById(xuri);
        indexDocument(xuri, placeOfPublicationModelToIndexMapper.createIndexDocument(placeOfPublicationModel, xuri));
    }

    private void doIndexPublisher(XURI xuri) throws Exception {
        Model publisherModel = entityService.retrieveById(xuri);
        indexDocument(xuri, publisherModelToIndexMapper.createIndexDocument(publisherModel, xuri));
    }

    private void doIndexWorkOnly(XURI xuri) throws Exception {
        doIndexWork(xuri, true);
    }

    private void doIndexSerial(XURI xuri) {
        Model serialModel = entityService.retrieveById(xuri);
        indexDocument(xuri, serialModelToIndexMapper.createIndexDocument(serialModel, xuri));
    }

    private void indexDocument(XURI xuri, String document) {
        try (CloseableHttpClient httpclient = createDefault()) {
            HttpPut httpPut = new HttpPut(getIndexUriBuilder()
                    .setPath(format("/search/%s/%s", xuri.getType(), encode(xuri.getUri(), UTF_8)))
                    .build());
            httpPut.setEntity(new StringEntity(document, Charset.forName(UTF_8)));
            httpPut.setHeader(HttpHeaders.CONTENT_TYPE, ContentType.APPLICATION_JSON.withCharset(UTF_8).toString());
            try (CloseableHttpResponse putResponse = httpclient.execute(httpPut)) {
                LOG.debug(putResponse.getStatusLine().toString());
            }
        } catch (Exception e) {
            LOG.error(format("Failed to index %s in elasticsearch", xuri.getUri()), e);
            throw new ServerErrorException(e.getMessage(), INTERNAL_SERVER_ERROR);
        }
    }

    private Response doSearch(String query, URIBuilder searchUriBuilder) {
        try {
            HttpGet httpGet = new HttpGet(searchUriBuilder.setParameter("q", query).build());
            return executeHttpRequest(httpGet);
        } catch (Exception e) {
            LOG.error(e.getMessage(), e);
            throw new ServerErrorException(e.getMessage(), INTERNAL_SERVER_ERROR);
        }
    }

    private void doIndexPersonOnly(XURI xuri) throws Exception {
        doIndexPerson(xuri, true);
    }

    private URIBuilder getIndexUriBuilder() {
        try {
            return new URIBuilder(this.elasticSearchBaseUrl);
        } catch (URISyntaxException e) {
            LOG.error("Failed to create uri builder for elasticsearch");
            throw new RuntimeException(e);
        }
    }

    private URIBuilder getWorkSearchUriBuilder(MultivaluedMap<String, String> queryParams) {
        URIBuilder uriBuilder = getIndexUriBuilder().setPath("/search/work/_search");
        if (queryParams != null && !queryParams.isEmpty()) {
            List<NameValuePair> nvpList = new ArrayList<>(queryParams.size());
            queryParams.forEach((key, values) -> {
                values.forEach(value -> {
                    nvpList.add(new BasicNameValuePair(key, value));
                });
            });
            uriBuilder.setParameters(nvpList);
        }
        return uriBuilder;
    }

    private URIBuilder getPersonSearchUriBuilder() {
        return getIndexUriBuilder().setPath("/search/person/_search");
    }

    public final URIBuilder getPlaceOfPublicationUriBuilder() {
        return getIndexUriBuilder().setPath("/search/placeOfPublication/_search");
    }

    public final URIBuilder getPublisherSearchUriBuilder() {
        return getIndexUriBuilder().setPath("/search/publisher/_search");
    }

    public final URIBuilder getSerialSearchUriBuilder() {
        return getIndexUriBuilder().setPath("/search/serial/_search");
    }
}
