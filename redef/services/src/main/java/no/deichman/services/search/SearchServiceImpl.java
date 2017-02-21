package no.deichman.services.search;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.jamonapi.Monitor;
import com.jamonapi.MonitorFactory;
import no.deichman.services.entity.EntityService;
import no.deichman.services.entity.EntityType;
import no.deichman.services.uridefaults.XURI;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.tuple.Pair;
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
import org.apache.http.entity.InputStreamEntity;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.ServerErrorException;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;

import static com.google.common.collect.ImmutableMap.of;
import static com.google.common.collect.Lists.newArrayList;
import static com.google.common.collect.Sets.newConcurrentHashSet;
import static java.lang.String.format;
import static java.lang.System.currentTimeMillis;
import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.net.HttpURLConnection.HTTP_OK;
import static java.net.URLEncoder.encode;
import static java.util.Arrays.stream;
import static java.util.stream.Collectors.toList;
import static javax.ws.rs.core.HttpHeaders.CONTENT_LENGTH;
import static javax.ws.rs.core.HttpHeaders.CONTENT_TYPE;
import static javax.ws.rs.core.Response.Status.INTERNAL_SERVER_ERROR;
import static no.deichman.services.uridefaults.BaseURI.ontology;
import static org.apache.http.entity.ContentType.APPLICATION_JSON;
import static org.apache.http.impl.client.HttpClients.createDefault;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;

/**
 * Responsibility: perform indexing and searching.
 */
public class SearchServiceImpl implements SearchService {
    private static final Logger LOG = LoggerFactory.getLogger(SearchServiceImpl.class);
    private static final String UTF_8 = "UTF-8";
    public static final int SIXTY_ONE = 61;
    public static final String[] LOCAL_INDEX_SEARCH_FIELDS = {
            ontology("name"),
            ontology("prefLabel"),
            ontology("mainTitle")
    };
    public static final int SILENT_PERIOD = 1000000;
    private final EntityService entityService;
    private final String elasticSearchBaseUrl;
    public static final Gson GSON = new GsonBuilder().setPrettyPrinting().create();
    private int skipped;
    private static Set<String> indexedUris;
    private static long lastIndexedTime;
    private static final int NUMTHREADS = 1;
    private static final long SIXTY = 60;
    private static final int COREPOOLSIZE = 4;
    private static final int MAXPOOLSIZE = 16;
    private static final ForkJoinPool THREADPOOL = new ForkJoinPool(NUMTHREADS);
    private static final ExecutorService EXECUTOR_SERVICE = new ThreadPoolExecutor(
            COREPOOLSIZE, MAXPOOLSIZE,
            SIXTY, TimeUnit.SECONDS,
            new LinkedBlockingQueue());

    public SearchServiceImpl(String elasticSearchBaseUrl, EntityService entityService) {
        this.elasticSearchBaseUrl = elasticSearchBaseUrl;
        this.entityService = entityService;
        getIndexUriBuilder();
    }

    @Override
    public final void index(XURI xuri) {
        try {
            if (indexedUris == null || !indexedUris.contains(xuri.getUri())) {
                LOG.info("Indexing " + xuri.getUri());

                // Index the requested resource
                doIndex(xuri);

                // Fetch a list of all connected resources which needs to be indexed as well
                Set<String> connectedResources = entityService.retrieveResourcesConnectedTo(xuri);
                enqueueIndexing(connectedResources, xuri);
            } else {
                LOG.info("Skipping already indexed uri: " + xuri.getUri());
                skipped++;
            }
            if (indexedUris != null) {
                indexedUris.add(xuri.getUri());
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public final void indexOnly(XURI xuri) throws Exception {
        if (indexedUris == null || !indexedUris.contains(xuri.getUri())) {
             LOG.info("Indexing " + xuri.getUri());
                doIndex(xuri);
        } else {
            LOG.info("Skipping already indexed uri: " + xuri.getUri());
            skipped++;
        }
        if (indexedUris != null) {
            indexedUris.add(xuri.getUri());
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
    public final Response searchPublicationWithJson(String json) {
        return searchWithJson(json, getPublicationSearchUriBuilder());
    }

    @Override
    public final Response searchInstrument(String query) {
        return doSearch(query, getInstrumentSearchUriBuilder());
    }

    @Override
    public final Response searchCompositionType(String query) {
        return doSearch(query, getCompositionTypeSearchUriBuilder());
    }

    @Override
    public final Response searchEvent(String query) {
        return doSearch(query, getEventSearchUriBuilder());
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
            HttpPut createIndexRequest = new HttpPut(uri);
            createIndexRequest.setEntity(new InputStreamEntity(getClass().getResourceAsStream("/search_index.json"), APPLICATION_JSON));
            try (CloseableHttpResponse create = httpclient.execute(createIndexRequest)) {
                int statusCode = create.getStatusLine().getStatusCode();
                LOG.info("Create index request returned status " + statusCode);
                if (statusCode != HTTP_OK) {
                    throw new ServerErrorException("Failed to create elasticsearch index", HTTP_INTERNAL_ERROR);
                }
            }
            putIndexMapping(httpclient, "work");
            putIndexMapping(httpclient, "person");
            putIndexMapping(httpclient, "serial");
            putIndexMapping(httpclient, "corporation");
            putIndexMapping(httpclient, "place");
            putIndexMapping(httpclient, "subject");
            putIndexMapping(httpclient, "genre");
            putIndexMapping(httpclient, "publication");
            putIndexMapping(httpclient, "instrument");
            putIndexMapping(httpclient, "compositionType");
            putIndexMapping(httpclient, "event");
            putIndexMapping(httpclient, "workSeries");

            return Response.status(Response.Status.OK).build();
        } catch (Exception e) {
            LOG.error(e.getMessage(), e);
            throw new ServerErrorException(e.getMessage(), INTERNAL_SERVER_ERROR);
        }
    }

    private void putIndexMapping(CloseableHttpClient httpclient, String type) throws URISyntaxException, IOException {
        URI workIndexUri = getIndexUriBuilder().setPath("/search/_mapping/" + type).build();
        HttpPut putWorkMappingRequest = new HttpPut(workIndexUri);
        putWorkMappingRequest.setEntity(new InputStreamEntity(getClass().getResourceAsStream("/" + type + "_mapping.json"), APPLICATION_JSON));
        try (CloseableHttpResponse create = httpclient.execute(putWorkMappingRequest)) {
            int statusCode = create.getStatusLine().getStatusCode();
            LOG.info("Create mapping request for " + type + " returned status " + statusCode);
            if (statusCode != HTTP_OK) {
                throw new ServerErrorException("Failed to create elasticsearch mapping for " + type, HTTP_INTERNAL_ERROR);
            }
        }
    }

    private Response searchWithJson(String body, URIBuilder searchUriBuilder, Function<String, String>... jsonTranformer) {
        try {
            HttpPost httpPost = new HttpPost(searchUriBuilder.build());
            httpPost.setEntity(new StringEntity(body, StandardCharsets.UTF_8));
            httpPost.setHeader(CONTENT_TYPE, "application/json");
            Pair<String, Header[]> searchResult = executeHttpRequest(httpPost);
            if (jsonTranformer != null && jsonTranformer.length > 0) {
                String transformed = jsonTranformer[0].apply(searchResult.getLeft());
                Header[] headers = searchResult.getRight();
                searchResult = Pair.of(transformed, removeHeader(headers, CONTENT_LENGTH));
            }
            return createResponse(searchResult);
        } catch (Exception e) {
            LOG.error(e.getMessage(), e);
            throw new ServerErrorException(e.getMessage(), INTERNAL_SERVER_ERROR);
        }
    }

    private Header[] removeHeader(Header[] headers, String headerName) {
        return stream(headers)
                .filter(header -> !header
                        .getName()
                        .toLowerCase()
                        .equalsIgnoreCase(headerName))
                .toArray(Header[]::new);
    }

    private Response createResponse(Pair<String, Header[]> searchResult) {
        Response.ResponseBuilder responseBuilder = Response.ok(searchResult.getLeft());
        for (Header header : searchResult.getRight()) {
            responseBuilder = responseBuilder.header(header.getName(), header.getValue());
        }
        return responseBuilder.build();
    }

    private Pair<String, Header[]> executeHttpRequest(HttpRequestBase httpRequestBase) throws IOException {
        try (CloseableHttpClient httpclient = createDefault();
             CloseableHttpResponse response = httpclient.execute(httpRequestBase)) {
            HttpEntity responseEntity = response.getEntity();
            String jsonContent = IOUtils.toString(responseEntity.getContent());
            Header[] headers = response.getAllHeaders();
            return Pair.<String, Header[]>of(jsonContent, headers);
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
    public final Response searchPlace(String query) {
        return doSearch(query, getPlaceUriBuilder());
    }

    @Override
    public final Response searchCorporation(String query) {
        return doSearch(query, getCorporationSearchUriBuilder());
    }

    @Override
    public final Response searchSerial(String query) {
        return doSearch(query, getSerialSearchUriBuilder());
    }

    @Override
    public final Response searchSubject(String query) {
        return doSearch(query, getSubjectSearchUriBuilder());
    }

    @Override
    public final Response searchGenre(String query) {
        return doSearch(query, getGenreSearchUriBuilder());
    }

    @Override
    public final Response searchPublication(String query) {
        return doSearch(query, getPublicationSearchUriBuilder());
    }

    @Override
    public final void delete(XURI xuri) {
        try (CloseableHttpClient httpclient = createDefault()) {
            HttpDelete httpDelete = new HttpDelete(getIndexUriBuilder()
                    .setPath(format("/search/%s/%s", xuri.getType(), encode(xuri.getUri(), UTF_8)))
                    .build());
            try (CloseableHttpResponse putResponse = httpclient.execute(httpDelete)) {
                // no-op
            }
        } catch (Exception e) {
            LOG.error(format("Failed to delete %s in elasticsearch", xuri.getUri()), e);
            throw new ServerErrorException(e.getMessage(), INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public final Response sortedList(String type, String prefix, int minSize, String field) {
        EntityType entityType = EntityType.get(type);
        URIBuilder searchUriBuilder = getIndexUriBuilder().setPath("/search/" + type + "/_search").setParameter("size", Integer.toString(minSize));
        switch (entityType) {
            case PERSON:
            case CORPORATION:
            case PLACE:
            case SUBJECT:
            case EVENT:
            case WORK_SERIES:
            case SERIAL:
            case GENRE:
            case MUSICAL_INSTRUMENT:
            case MUSICAL_COMPOSITION_TYPE:
                Collection<NameEntry> nameEntries = entityService.neighbourhoodOfName(entityType, prefix, minSize);
                return searchWithJson(createPreIndexedSearchQuery(minSize, nameEntries),
                        searchUriBuilder, orderResultByIdOrder(nameEntries
                                .stream()
                                .map(NameEntry::getUri)
                                .collect(toList())));
            default:
                return searchWithJson(createSortedListQuery(prefix, minSize, field), searchUriBuilder);
        }
    }

    private Function<String, String> orderResultByIdOrder(Collection<String> ids) {
        Map<String, Integer> desiredOrder = new HashMap<>(ids.size());
        final int[] i = new int[]{0};
        ids.forEach(id -> desiredOrder.put(urlEncode(id), i[0]++));

        return s -> {
            Map fromJson = GSON.fromJson(s, Map.class);
            ((List) ((Map) fromJson.get("hits")).get("hits")).sort((o1, o2) -> {
                String id1 = (String) ((Map) o1).get("_id");
                String id2 = (String) ((Map) o2).get("_id");
                return desiredOrder.get(id1).compareTo(desiredOrder.get(id2));
            });
            return GSON.toJson(fromJson);
        };
    }

    private String createSortedListQuery(String prefix, int minSize, String field) {
        String sortedListQuery;
        List<Map> should = new ArrayList<>();
        for (int i = 0; i < prefix.length(); i++) {
            should.add(
                    of("constant_score",
                            of("boost", 2 << Math.max(prefix.length() - i, SIXTY_ONE), "query",
                                    of("match_phrase_prefix", of(field, prefix.substring(0, prefix.length() - i))))));
        }
        sortedListQuery = GSON.toJson(of(
                "size", minSize,
                "query", of(
                        "bool", of(
                                "should", should)
                )
        ));
        return sortedListQuery;
    }

    private String createPreIndexedSearchQuery(int minSize, Collection<NameEntry> nameEntries) {
        List<Map> should = new ArrayList<>();
        should.addAll(nameEntries
                .stream()
                .filter(NameEntry::isBestMatch)
                .map(e -> of(
                        "ids", of("values", newArrayList(urlEncode(e.getUri())))))
                .collect(toList()));
        should.add(of(
                "ids", of("values",
                        nameEntries
                                .stream()
                                .map(NameEntry::getUri)
                                .map(SearchServiceImpl::urlEncode)
                                .collect(toList())
                )
        ));
        return GSON.toJson(
                of(
                        "size", minSize,
                        "query", of(
                                "bool", of("should", should)
                        )
                )
        );
    }

    private static String urlEncode(String uri) {
        return uri.replace(":", "%3A").replace("/", "%2F");
    }

    @Override
    public final Response searchWorkWhereUriIsSubject(String subjectUri, int maxSize) {
        String body = GSON.toJson(of(
                "size", maxSize,
                "query", of(
                        "nested", of(
                                "path", "subjects",
                                "query", of("term", of(
                                        "subjects.uri", subjectUri)
                                )
                        )
                )
        ));
        return searchWithJson(body, getIndexUriBuilder().setPath("/search/work/_search"));
    }

    @Override
    public final Response searchWorkSeries(String query) {
        return doSearch(query, getWorkSeriesSearchUriBuilder());
    }

    @Override
    public final void indexUrisOnlyOnce(boolean indexOnce) {
        if (indexOnce) {
            LOG.info("Turning on only once uri indexing");
            indexedUris = newConcurrentHashSet();
            skipped = 0;
        } else {
            LOG.info("Turning off only once uri indexing after skipping " + skipped + " uris");
            indexedUris = null;
            lastIndexedTime = 0;
        }
    }

    private URIBuilder getWorkSeriesSearchUriBuilder() {
        return getIndexUriBuilder().setPath("/search/workSeries/_search");
    }

    @Override
    public final void enqueueIndexingAllResources() {
         THREADPOOL.execute(new Runnable() {
            @Override
            public void run() {
                for (EntityType type : EntityType.values()) {
                    entityService.retrieveAllWorkUris(type.getPath(), uri -> EXECUTOR_SERVICE.execute(() -> {
                        try {
                            indexOnly(new XURI(uri));
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }));
                }
            }
        });
    }

    @Override
    public final void enqueueIndexingAllOfType(String type, Boolean ignoreConnectedResources) {
        THREADPOOL.execute(new Runnable() {
            @Override
            public void run() {
                LOG.info("Starting to reindex all resources of type " + type);

                entityService.retrieveAllWorkUris(type, uri -> EXECUTOR_SERVICE.execute(() -> {
                    try {
                        if (ignoreConnectedResources) {
                            indexOnly(new XURI(uri));
                        } else {
                            index(new XURI(uri));
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }));
            }
        });
    }

    @Override
    public final void enqueueIndexing(Set<String> uris, XURI triggeredBy) {
        LOG.info("Enqueuing indexing of " + uris.size() + " resources triggered by changes in <" + triggeredBy.getUri() + ">");
        THREADPOOL.execute(new Runnable() {
            @Override
            public void run() {
                uris.forEach(uri -> EXECUTOR_SERVICE.execute(() -> {
                    try {
                        LOG.info("Indexing <" + uri + "> triggered by changes in <" + triggeredBy.getUri() + ">");
                        doIndex(new XURI(uri));
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }));
            }
        });
    }

    private void doIndex(XURI xuri) throws Exception {

        Model indexModel;
        switch (xuri.getTypeAsEntityType()) {
            case WORK:
                indexModel = entityService.retrieveWorkWithLinkedResources(xuri);
                break;
            case PUBLICATION:
                indexModel = entityService.retrieveById(xuri);
                Property publicationOfProperty = createProperty(ontology("publicationOf"));
                if (indexModel.getProperty(null, publicationOfProperty) != null) {
                    String workUri = indexModel.getProperty(createResource(xuri.toString()), publicationOfProperty).getObject().toString();
                    XURI workXURI = new XURI(workUri);
                    indexModel = entityService.retrieveWorkWithLinkedResources(workXURI);
                }
                break;
            case EVENT:
                indexModel = entityService.retrieveEventWithLinkedResources(xuri);
                break;
            case PERSON:
                indexModel = entityService.retrievePersonWithLinkedResources(xuri);
                break;
            case CORPORATION:
                indexModel = entityService.retrieveCorporationWithLinkedResources(xuri);
                break;
            case SERIAL:
                indexModel = entityService.retrieveSerialWithLinkedResources(xuri);
            default:
                indexModel = entityService.retrieveById(xuri);
                break;
        }
        Monitor mon = MonitorFactory.start("createIndexDocument");
        String indexDocument = new ModelToIndexMapper(xuri.getTypeAsEntityType().getPath()).createIndexDocument(indexModel, xuri);
        mon.stop();
        indexDocument(xuri, indexDocument);
        cacheNameIndex(xuri, indexModel);
    }

    private void cacheNameIndex(XURI xuri, Model indexModel) {
        entityService.statementsInModelAbout(xuri, indexModel, LOCAL_INDEX_SEARCH_FIELDS)
                .forEachRemaining(statement -> {
                    entityService.addIndexedName(
                            xuri.getTypeAsEntityType(),
                            statement.getObject().asLiteral().toString(),
                            statement.getSubject().getURI());
                });
    }


    private void indexDocument(XURI xuri, String document) {
        long now = currentTimeMillis();
        if (indexedUris != null && lastIndexedTime > 0 && now - lastIndexedTime > SILENT_PERIOD) {
            indexUrisOnlyOnce(false);
        }
        if (indexedUris == null || !indexedUris.contains(xuri.getUri())) {
            try (CloseableHttpClient httpclient = createDefault()) {
                HttpPut httpPut = new HttpPut(getIndexUriBuilder()
                        .setPath(format("/search/%s/%s", xuri.getType(), encode(xuri.getUri(), UTF_8))) // TODO drop urlencoded ID, and define _id in mapping from field uri
                        .build());
                httpPut.setEntity(new StringEntity(document, Charset.forName(UTF_8)));
                httpPut.setHeader(CONTENT_TYPE, APPLICATION_JSON.withCharset(UTF_8).toString());
                Monitor mon = MonitorFactory.start("indexDocument");
                try (CloseableHttpResponse putResponse = httpclient.execute(httpPut)) {
                    // no-op
                } finally {
                    mon.stop();
                }
                lastIndexedTime = now;
            } catch (Exception e) {
                LOG.error(format("Failed to index %s in elasticsearch", xuri.getUri()), e);
                throw new ServerErrorException(e.getMessage(), INTERNAL_SERVER_ERROR);
            }
        } else {
            LOG.info("Skipping already indexed uri: " + xuri.getUri());
            skipped++;
        }
        if (indexedUris != null) {
            indexedUris.add(xuri.getUri());
        }
    }

    private Response doSearch(String query, URIBuilder searchUriBuilder) {
        try {
            HttpGet httpGet = new HttpGet(searchUriBuilder
                    .setParameter("q", query)
                    .setParameter("size", "100")
                    .build());
            return createResponse(executeHttpRequest(httpGet));
        } catch (Exception e) {
            LOG.error(e.getMessage(), e);
            throw new ServerErrorException(e.getMessage(), INTERNAL_SERVER_ERROR);
        }
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

    public final URIBuilder getPlaceUriBuilder() {
        return getIndexUriBuilder().setPath("/search/place/_search");
    }

    public final URIBuilder getCorporationSearchUriBuilder() {
        return getIndexUriBuilder().setPath("/search/corporation/_search");
    }

    public final URIBuilder getSerialSearchUriBuilder() {
        return getIndexUriBuilder().setPath("/search/serial/_search");
    }

    public final URIBuilder getSubjectSearchUriBuilder() {
        return getIndexUriBuilder().setPath("/search/subject/_search");
    }

    public final URIBuilder getGenreSearchUriBuilder() {
        return getIndexUriBuilder().setPath("/search/genre/_search");
    }

    public final URIBuilder getPublicationSearchUriBuilder() {
        return getIndexUriBuilder().setPath("/search/publication/_search");
    }

    public final URIBuilder getInstrumentSearchUriBuilder() {
        return getIndexUriBuilder().setPath("/search/instrument/_search");
    }

    public final URIBuilder getCompositionTypeSearchUriBuilder() {
        return getIndexUriBuilder().setPath("/search/compositionType/_search");
    }

    private URIBuilder getEventSearchUriBuilder() {
        return getIndexUriBuilder().setPath("/search/event/_search");
    }
}
