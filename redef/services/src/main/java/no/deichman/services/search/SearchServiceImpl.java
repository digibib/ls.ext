package no.deichman.services.search;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
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
import org.apache.http.util.EntityUtils;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.ResIterator;
import org.apache.jena.rdf.model.Resource;
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
import static java.lang.String.format;
import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.net.HttpURLConnection.HTTP_NOT_FOUND;
import static java.net.HttpURLConnection.HTTP_NO_CONTENT;
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
    private static final String DISPLAY_LINE_1 = "displayLine1";
    private final EntityService entityService;
    private final String elasticSearchBaseUrl;
    public static final Gson GSON = new GsonBuilder().setPrettyPrinting().create();
    private static final int NUMTHREADS = 1;
    private static final long SIXTY = 60;
    private static final int COREPOOLSIZE = 16;
    private static final int MAXPOOLSIZE = 32;
    private static final ForkJoinPool THREADPOOL = new ForkJoinPool(NUMTHREADS);
    private static final LinkedBlockingQueue INDEX_QUEUE = new LinkedBlockingQueue();
    private static final ExecutorService EXECUTOR_SERVICE = new ThreadPoolExecutor(
            COREPOOLSIZE, MAXPOOLSIZE,
            SIXTY, TimeUnit.SECONDS,
            INDEX_QUEUE);

    private static Map<EntityType, NameIndexer> nameIndexers = new HashMap<EntityType, NameIndexer>();

    public SearchServiceImpl(String elasticSearchBaseUrl, EntityService entityService) {
        this.elasticSearchBaseUrl = elasticSearchBaseUrl;
        this.entityService = entityService;
        getIndexUriBuilder();
        for (EntityType type : EntityType.values()) {
            if (type != EntityType.WORK && type != EntityType.PUBLICATION) {
                getNameIndexer(type);
            }
        }
    }

    public SearchServiceImpl(String elasticSearchBaseUrl) {
        this.elasticSearchBaseUrl = elasticSearchBaseUrl;
        this.entityService = null;
    }

    @Override
    public final void index(XURI xuri) {
        try {
            LOG.info("Indexing " + xuri.getUri());

            // Index the requested resource
            doIndex("search", xuri);

            // Fetch a list of all connected resources which needs to be indexed as well
            Set<String> connectedResources = entityService.retrieveResourcesConnectedTo(xuri);
            enqueueIndexing(connectedResources, xuri);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public final void indexOnly(XURI xuri) throws Exception {
        indexOnly("search", xuri);
    }

    public final void indexWorkAndPublications(XURI xuri) throws Exception {
        indexWorkAndPublications("search", xuri);
    }

    private void indexOnly(String idx, XURI xuri) throws Exception {
        LOG.info("Indexing " + xuri.getUri());
        doIndex(idx, xuri);
    }

    private void indexWorkAndPublications(String idx, XURI xuri) throws Exception {
        LOG.info("Indexing " + xuri.getUri() + " with publications");
        Model indexModel = entityService.retrieveWorkWithLinkedResources(xuri);
        Map<String, Object> indexDocument = new ModelToIndexMapper(EntityType.WORK.getPath()).createIndexObject(indexModel, xuri);
        indexDocument(idx, xuri, GSON.toJson(indexDocument), null);
        cacheNameIndex(xuri, indexDocument);
        ResIterator subjectIterator = indexModel.listSubjects();
        while (subjectIterator.hasNext()) {
            Resource subj = subjectIterator.next();
            if (subj.isAnon()) {
                continue;
            }
            if (subj.toString().contains("publication")) { // TODO match more accurately with { subj :publicationOf <xuri> }
                XURI pubUri = new XURI(subj.toString());
                LOG.info("Indexing " + pubUri.getUri());
                Map<String, Object> doc = new ModelToIndexMapper("publication").createIndexObject(indexModel, pubUri);
                indexDocument(idx, pubUri, GSON.toJson(doc), xuri);
                cacheNameIndex(pubUri, doc);
            }
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
        clearIndex("a");
        clearIndex("b");
        toggleActiveIndex("a");
        return Response.status(Response.Status.OK).build();
    }

    private void deleteIndex(CloseableHttpClient closeableHttpClient, String index) {
        try {
            URI uri = getIndexUriBuilder().setPath("/" + index).build();
            HttpDelete httpDelete = new HttpDelete(uri);
            try (CloseableHttpResponse closeableHttpResponse = closeableHttpClient.execute(httpDelete)) {
                int statusCode = closeableHttpResponse.getStatusLine().getStatusCode();
                // Delete can potentially return 200, 204 or 404, all indicating the resource is deleted as expected
                if (statusCode == HTTP_OK || statusCode == HTTP_NO_CONTENT || statusCode == HTTP_NOT_FOUND) {
                    LOG.info("Deleting index {} was successful, request returned code {}", index, statusCode);
                } else {
                    LOG.error("Deleting index {} was not successful, request returned code {}", index, statusCode);
                    throw new ServerErrorException("Failed to delete elasticsearch index", HTTP_INTERNAL_ERROR);
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        } catch (URISyntaxException e) {
            e.printStackTrace();
        }
    }

    private void putNewIndex(CloseableHttpClient closeableHttpClient, String index) {
        try {
            URI uri = getIndexUriBuilder().setPath("/" + index).build();
            HttpPut createIndexRequest = new HttpPut(uri);
            createIndexRequest.setEntity(new InputStreamEntity(getClass().getResourceAsStream("/search_index.json"), APPLICATION_JSON));
            try (CloseableHttpResponse create = closeableHttpClient.execute(createIndexRequest)) {
                int statusCode = create.getStatusLine().getStatusCode();
                LOG.info("Create index request returned status " + statusCode);
                if (statusCode != HTTP_OK) {
                    throw new ServerErrorException("Failed to create elasticsearch index", HTTP_INTERNAL_ERROR);
                }
            }
        } catch (IOException | URISyntaxException e) {
            e.printStackTrace();
        }

    }

    private void clearIndex(String index) {
        try (CloseableHttpClient httpclient = createDefault()) {
            deleteIndex(httpclient, index);
            putNewIndex(httpclient, index);

            putIndexMapping(httpclient, index, "publication");
            putIndexMapping(httpclient, index, "work");
            putIndexMapping(httpclient, index, "person");
            putIndexMapping(httpclient, index, "serial");
            putIndexMapping(httpclient, index, "corporation");
            putIndexMapping(httpclient, index, "place");
            putIndexMapping(httpclient, index, "subject");
            putIndexMapping(httpclient, index, "genre");
            putIndexMapping(httpclient, index, "instrument");
            putIndexMapping(httpclient, index, "compositionType");
            putIndexMapping(httpclient, index, "event");
            putIndexMapping(httpclient, index, "workSeries");

        } catch (Exception e) {
            LOG.error(e.getMessage(), e);
            throw new ServerErrorException(e.getMessage(), INTERNAL_SERVER_ERROR);
        }
    }

    private void putIndexMapping(CloseableHttpClient httpclient, String idx, String type) throws URISyntaxException, IOException {
        URI workIndexUri = getIndexUriBuilder().setPath("/" + idx + "/_mapping/" + type).build();
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

    private void toggleActiveIndex(String idx) {
        removeAliases();
        addAlias(idx, "search");
    }

    private void addAlias(String from, String to) {
        try (CloseableHttpClient httpclient = createDefault()) {
            URI uri = getIndexUriBuilder().setPath("/" + from + "/_alias/" + to).build();
            try (CloseableHttpResponse res = httpclient.execute(new HttpPut(uri))) {
                int statusCode = res.getStatusLine().getStatusCode();
                LOG.info("Create index alias returned status " + statusCode);
                if (statusCode != HTTP_OK) {
                    LOG.error("Creating index alias failed, cause: " + IOUtils.toString(res.getEntity().getContent(), StandardCharsets.UTF_8));
                    throw new ServerErrorException("Failed to create index alias", HTTP_INTERNAL_ERROR);
                }
            }

        } catch (Exception e) {
            LOG.error(e.getMessage(), e);
            throw new ServerErrorException(e.getMessage(), INTERNAL_SERVER_ERROR);
        }
    }

    private boolean aliasExists(String aliasName) {
        String logString = (aliasName.equals("*")) ? "Inspecting Elasticsearch while initialising shows at least one"
                : "Inspecting Elasticsearch while initialising shows \"" + aliasName + "\"";
        boolean searchAliasExists = false;
        try (CloseableHttpClient closeableHttpClient = createDefault()) {
            URI uri1 = getIndexUriBuilder().setPath("/_alias/" + aliasName).build();
            try (CloseableHttpResponse closeableHttpResponse = closeableHttpClient.execute(new HttpGet(uri1))) {
                int statusCode = closeableHttpResponse.getStatusLine().getStatusCode();
                if (statusCode == 200) {
                    LOG.info(logString + " alias exists");
                    searchAliasExists = true;
                } else {
                    LOG.info(" alias does not exist");
                }
            }
        } catch (URISyntaxException | IOException e) {
            e.printStackTrace();
        }
        return searchAliasExists;
    }

    private void removeAliases() {
        try (CloseableHttpClient httpclient = createDefault()) {
            URI uri = getIndexUriBuilder().setPath("/_all/_aliases/search").build();
            try (CloseableHttpResponse res = httpclient.execute(new HttpDelete(uri))) {
                int statusCode = res.getStatusLine().getStatusCode();
                LOG.info("Delete index aliases returned status " + statusCode);
                if (statusCode != HTTP_OK && statusCode != HTTP_NOT_FOUND) {
                    throw new ServerErrorException("Failed to delete index aliases", HTTP_INTERNAL_ERROR);
                }
            }
        } catch (Exception e) {
            LOG.error(e.getMessage(), e);
            throw new ServerErrorException(e.getMessage(), INTERNAL_SERVER_ERROR);
        }
    }

    private String getActiveIndex() {
        // Check if index A is aliased to 'search'
        try (CloseableHttpClient httpclient = createDefault()) {
            URI uri = getIndexUriBuilder().setPath("/a/_alias/search").build();
            try (CloseableHttpResponse res = httpclient.execute(new HttpGet(uri))) {
                if (EntityUtils.toString(res.getEntity()).contains("search")) {
                    return "a";
                }
            }
        } catch (Exception e) {
            LOG.error(e.getMessage(), e);
            throw new ServerErrorException(e.getMessage(), INTERNAL_SERVER_ERROR);
        }
        // Index A is not aliased to 'search', so it must be index B
        return "b";
    }

    private String getInactiveIndex() {
        if (getActiveIndex().equals("a")) {
            return "b";
        } else {
            return "a";
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

    private String scrollSearch(String body, URIBuilder searchUriBuilder) {
        try {
            HttpPost httpPost = new HttpPost(searchUriBuilder.build());
            httpPost.setEntity(new StringEntity(body, StandardCharsets.UTF_8));
            httpPost.setHeader(CONTENT_TYPE, "application/json");
            CloseableHttpClient httpclient = createDefault();
            CloseableHttpResponse response = httpclient.execute(httpPost);
            int statusCode = response.getStatusLine().getStatusCode();
            if (statusCode != HTTP_OK) {
                throw new ServerErrorException("Failed to search elasticsearch: " + EntityUtils.toString(response.getEntity()), HTTP_INTERNAL_ERROR);
            }
            return EntityUtils.toString(response.getEntity());
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
                Collection<NameEntry> nameEntries = neighbourhoodOfName(entityType, prefix, minSize);
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

    private static String urlDecode(String uri) {
        return uri.replace("%3A", ":").replace("%2F", "/");
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

    private URIBuilder getWorkSeriesSearchUriBuilder() {
        return getIndexUriBuilder().setPath("/search/workSeries/_search");
    }

    @Override
    public final void enqueueIndexingAllResources() {
        THREADPOOL.execute(new Runnable() {
            @Override
            public void run() {
                String newIndex = getInactiveIndex();
                clearIndex(newIndex);

                for (EntityType type : EntityType.values()) {
                    if (type.equals(EntityType.PUBLICATION)) {
                        // Publications are indexed when the work they belong to are indexed
                        continue;
                    }
                    entityService.retrieveAllWorkUris(type.getPath(), uri -> EXECUTOR_SERVICE.execute(() -> {
                        try {
                            XURI resource = new XURI(uri);
                            if (resource.getTypeAsEntityType().equals(EntityType.WORK)) {
                                indexWorkAndPublications(newIndex, resource);
                            } else {
                                indexOnly(newIndex, resource);
                            }
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }));
                }

                while (true) {
                    try {
                        Thread.sleep(1000);
                    } catch (InterruptedException e) {
                        // no-op
                    }
                    if (INDEX_QUEUE.size() == 0) {
                        break;
                    }
                }

                LOG.info("Done indexing all resources - setting active index: " + newIndex);
                toggleActiveIndex(newIndex);
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
                        doIndex("search", new XURI(uri));
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }));
            }
        });
    }

    @Override
    public final Map<String, String> getAllSortLabelsForType(EntityType type) {
        Map<String, String> result = new HashMap<String, String>();

        String initialBody = "{\"size\":10000,\"query\":{\"match_all\":{}},\"sort\":[\"_doc\"]}";
        String scrollId = null;
        String resp;
        Boolean hasMore = true;
        while (hasMore) {
            URIBuilder uriBuilder;
            String body;
            if (scrollId == null) {
                uriBuilder = getSearchUriBuilder(type);
                uriBuilder.addParameter("scroll", "1m");
                body = initialBody;
            } else {
                uriBuilder = getScrollUriBuilder();
                body = GSON.toJson(of(
                        "scroll", "1m",
                        "scroll_id", scrollId
                ));
            }
            resp = scrollSearch(body, uriBuilder);
            JsonObject json = new JsonParser().parse(resp).getAsJsonObject();
            scrollId = json.get("_scroll_id").getAsString();
            JsonArray hits = json.getAsJsonObject("hits").getAsJsonArray("hits");
            for (JsonElement hit : hits) {
                if (hit.getAsJsonObject().get("_source").getAsJsonObject().has(DISPLAY_LINE_1)) {
                    result.put(
                            urlDecode(hit.getAsJsonObject().get("_id").getAsString()),
                            hit.getAsJsonObject().get("_source").getAsJsonObject().get(DISPLAY_LINE_1).getAsString());
                }
            }

            if (hits.size() == 0) {
                hasMore = false;
            }
        }

        return result;
    }

    private URIBuilder getSearchUriBuilder(EntityType type) {
        return getIndexUriBuilder().setPath("/search/" + type.getPath() + "/_search");
    }

    private void doIndex(String idx, XURI xuri) throws Exception {

        Model indexModel;
        XURI workXURI = null;
        switch (xuri.getTypeAsEntityType()) {
            case WORK:
                indexModel = entityService.retrieveWorkWithLinkedResources(xuri);
                break;
            case PUBLICATION:
                indexModel = entityService.retrieveById(xuri);
                Property publicationOfProperty = createProperty(ontology("publicationOf"));
                if (indexModel.getProperty(null, publicationOfProperty) != null) {
                    String workUri = indexModel.getProperty(createResource(xuri.toString()), publicationOfProperty).getObject().toString();
                    workXURI = new XURI(workUri);
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
                break;
            default:
                indexModel = entityService.retrieveById(xuri);
                break;
        }
        Monitor mon = MonitorFactory.start("createIndexDocument");
        Map<String, Object> indexDocument = new ModelToIndexMapper(xuri.getTypeAsEntityType().getPath()).createIndexObject(indexModel, xuri);
        mon.stop();
        indexDocument(idx, xuri, GSON.toJson(indexDocument), workXURI);
        cacheNameIndex(xuri, indexDocument);
    }

    private void cacheNameIndex(XURI xuri, Map<String, Object> doc) {
        if (xuri.getTypeAsEntityType() == EntityType.PUBLICATION || xuri.getTypeAsEntityType() == EntityType.WORK) {
            // We don't want to keep in-memory indexes of Publication & Work resources,
            // as Catalinker has no need for them.
            return;
        }
        if (doc.containsKey("displayLine1")) {
            addIndexedName(
                    xuri.getTypeAsEntityType(),
                    doc.get("displayLine1").toString(),
                    xuri.getUri());
        }
    }


    private void indexDocument(String idx, XURI xuri, String document, XURI parentUri) {
        try (CloseableHttpClient httpclient = createDefault()) {
            final URIBuilder uriBuilder = getIndexUriBuilder()
                    .setPath(format("/" + idx + "/%s/%s", xuri.getType(), encode(xuri.getUri(), UTF_8)));
            if (parentUri != null) {
                uriBuilder.setParameter("parent", encode(parentUri.getUri(), UTF_8));
            }
            HttpPut httpPut = new HttpPut(uriBuilder // TODO drop urlencoded ID, and define _id in mapping from field uri
                    .build());
            httpPut.setEntity(new StringEntity(document, Charset.forName(UTF_8)));
            httpPut.setHeader(CONTENT_TYPE, APPLICATION_JSON.withCharset(UTF_8).toString());
            Monitor mon = MonitorFactory.start("indexDocument");
            try (CloseableHttpResponse putResponse = httpclient.execute(httpPut)) {
                // no-op
            } finally {
                mon.stop();
            }
        } catch (Exception e) {
            LOG.error(format("Failed to index %s in elasticsearch", xuri.getUri()), e);
            throw new ServerErrorException(e.getMessage(), INTERNAL_SERVER_ERROR);
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

    private URIBuilder getScrollUriBuilder() {
        try {
            return new URIBuilder(this.elasticSearchBaseUrl + "/_search/scroll");
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

    private NameIndexer getNameIndexer(EntityType type) {
        NameIndexer nameIndexer = nameIndexers.get(type);
        if (nameIndexer == null) {
            LOG.info("Creating local index for " + type);
            long start = System.currentTimeMillis();
            nameIndexers.put(type, new InMemoryNameIndexer()); // Store immediately, so we can't trigger multiple initial loads
            nameIndexers.put(type, new InMemoryNameIndexer(getAllSortLabelsForType(type)));
            LOG.info(String.format("Created local index for %s with %d entries in %d msec", type, nameIndexers.get(type).size(), System.currentTimeMillis() - start));
        }
        return nameIndexer;
    }

    @Override
    public final void addIndexedName(EntityType type, String name, String uri) {
        getNameIndexer(type).addNamedItem(name, uri);
    }

    private void removeIndexedName(EntityType type, String name, String uri) {
        getNameIndexer(type).removeNamedItem(name, uri);
    }

    @Override
    public final void removeFromLocalIndex(XURI xuri) {
        getNameIndexer(xuri.getTypeAsEntityType()).removeUri(xuri.getUri());
    }

    @Override
    public final Collection<NameEntry> neighbourhoodOfName(EntityType type, String name, int width) {
        return getNameIndexer(type).neighbourhoodOf(name, width);
    }
}
