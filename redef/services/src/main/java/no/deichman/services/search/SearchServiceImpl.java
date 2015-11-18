package no.deichman.services.search;

import com.google.common.collect.ImmutableMap;
import no.deichman.services.entity.EntityService;
import no.deichman.services.entity.EntityType;
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
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ResIterator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.ServerErrorException;
import javax.ws.rs.core.Response;
import java.net.URISyntaxException;
import java.nio.charset.Charset;
import java.util.Map;

import static com.google.common.collect.ImmutableMap.of;
import static java.lang.String.format;
import static java.net.URLEncoder.encode;
import static javax.ws.rs.core.Response.Status.INTERNAL_SERVER_ERROR;
import static org.apache.http.impl.client.HttpClients.createDefault;

/**
 * Responsibility: perform indexing and searching.
 */
public class SearchServiceImpl implements SearchService {
    private static final Logger LOG = LoggerFactory.getLogger(SearchServiceImpl.class);
    private static final String UTF_8 = "UTF-8";
    private static final String WORK_MODEL_TO_INDEX_DOCUMENT_QUERY = format("PREFIX  : <%1$s> \n"
            + "select distinct ?work ?workTitle ?workYear ?creatorName ?creator ?birth ?death\n"
            + "where {\n"
            + "    ?work a :Work ;\n"
            + "             :title ?workTitle ;\n"
            + "             :year ?workYear.\n"
            + "    optional { \n"
            + "             ?work :creator ?creator .\n"
            + "             ?creator a :Person ;\n"
            + "                      :name ?creatorName.\n"
            + "             optional {?creator :birth ?birth.}\n"
            + "             optional {?creator :death ?death.}\n"
            + "    }\n"
            + "}\n", BaseURI.remote().ontology());

    private static final String PERSON_MODEL_TO_INDEX_DOCUMENT_QUERY = format("PREFIX  : <%1$s> \n"
            + "select distinct ?person ?personName ?birth ?death\n"
            + "where {\n"
            + "    ?person a :Person ;\n"
            + "             :name ?personName .\n"
            + "    optional {?person :birth ?birth.}\n"
            + "    optional {?person :death ?death.}\n"
            + "}\n", BaseURI.remote().ontology());

    private static final ImmutableMap<String, String> WORK_MODEL_TO_INDEX_DOCUMENT_MAPPING = new ImmutableMap.Builder<String, String>()
            .putAll(of("work", "work.uri", "workTitle", "work.title", "workYear", "work.year"))
            .putAll(of("creatorName", "work.creator.name", "creator", "work.creator.uri"))
            .putAll(of("birth", "work.creator.birth", "death", "work.creator.death"))
            .build();

    private static final ImmutableMap<String, String> PERSON_MODEL_TO_INDEX_DOCUMENT_MAPPING = of(
            "person", "person.uri", "personName", "person.name", "birth", "person.birth", "death", "person.death"
    );

    public static final String WORK_INDEX_TYPE = "work";
    public static final String PERSON_INDEX_TYPE = "person";
    private final URIBuilder indexUriBuilder;
    private final URIBuilder workSearchUriBuilder;
    private final URIBuilder personSearchUriBuilder;
    private final EntityService entityService;


    public SearchServiceImpl(String elasticSearchBaseUrl, EntityService entityService) {
        try {
            indexUriBuilder = new URIBuilder(elasticSearchBaseUrl);
            workSearchUriBuilder = new URIBuilder(elasticSearchBaseUrl).setPath("/search/work/_search");
            personSearchUriBuilder = new URIBuilder(elasticSearchBaseUrl).setPath("/search/person/_search");
            this.entityService = entityService;
        } catch (URISyntaxException e) {
            LOG.error("Failed to create uri builder for elasticsearch");
            throw new RuntimeException(e);
        }
    }

    @Override
    public final void indexWork(String workId) {
        Model workModelWithLinkedResources = entityService.retrieveWorkWithLinkedResources(workId);
        indexModel(workModelWithLinkedResources, WORK_MODEL_TO_INDEX_DOCUMENT_QUERY, WORK_INDEX_TYPE, WORK_MODEL_TO_INDEX_DOCUMENT_MAPPING);
    }

    @Override
    public final void indexPerson(String personId) {
        Model works = entityService.retrieveWorksByCreator(personId);
        ResIterator subjectIterator = works.listSubjects();
        while (subjectIterator.hasNext()) {
            String workUri = subjectIterator.next().toString();
            String workId = workUri.substring(workUri.lastIndexOf("/") + 1);
            indexWork(workId);
        }
        Model personModel = entityService.retrieveById(EntityType.PERSON, personId);
        indexModel(personModel, PERSON_MODEL_TO_INDEX_DOCUMENT_QUERY, PERSON_INDEX_TYPE, PERSON_MODEL_TO_INDEX_DOCUMENT_MAPPING);
    }

    private void indexModel(Model m, String query, String type, Map<String, String> modelToIndexDocumentMapping) {
        ModelIndexMapper.modelToIndexDocument(m, query, type, modelToIndexDocumentMapping)
                .ifPresent(document -> indexDocument(type, document.getKey(), document.getValue()));
    }

    private void indexDocument(String type, String uri, String document) {
        try (CloseableHttpClient httpclient = createDefault()) {
            HttpPut httpPut = new HttpPut(indexUriBuilder
                    .setPath(format("/search/%s/%s", type, encode(uri, UTF_8)))
                    .build());
            httpPut.setEntity(new StringEntity(document, Charset.forName(UTF_8)));
            try (CloseableHttpResponse putResponse = httpclient.execute(httpPut)) {
                LOG.debug(putResponse.getStatusLine().toString());
            }
        } catch (Exception e) {
            LOG.error(format("Failed to index %s in elasticsearch", uri), e);
            throw new ServerErrorException(e.getMessage(), INTERNAL_SERVER_ERROR);
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
        try (CloseableHttpClient httpclient = createDefault()) {
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
            throw new ServerErrorException(e.getMessage(), INTERNAL_SERVER_ERROR);
        }
    }


}
