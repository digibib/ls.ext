package no.deichman.services.search;

import no.deichman.services.entity.EntityService;
import no.deichman.services.entity.EntityType;
import no.deichman.services.entity.repository.RDFRepository;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.http.Header;
import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.ResIterator;
import org.apache.jena.rdf.model.Statement;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.ServerErrorException;
import javax.ws.rs.core.Response;
import java.net.URISyntaxException;
import java.nio.charset.Charset;
import java.util.Optional;

import static java.lang.String.format;
import static java.net.URLEncoder.encode;
import static javax.ws.rs.core.Response.Status.INTERNAL_SERVER_ERROR;
import static no.deichman.services.search.ModelToIndexMapper.ModelToIndexMapperBuilder.modelToIndexMapperBuilder;
import static no.deichman.services.uridefaults.BaseURI.remote;
import static org.apache.http.impl.client.HttpClients.createDefault;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;

/**
 * Responsibility: perform indexing and searching.
 */
public class SearchServiceImpl implements SearchService {
    public static final String WORK_INDEX_TYPE = "work";
    public static final String PERSON_INDEX_TYPE = "person";
    private final URIBuilder indexUriBuilder;
    private final URIBuilder workSearchUriBuilder;
    private final URIBuilder personSearchUriBuilder;
    private final EntityService entityService;

    public static final Property CREATOR = createProperty(remote().ontology("creator"));
    private final RDFRepository rdfRepository;
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
            + "}\n", remote().ontology());

    private ModelToIndexMapper worksModelToIndexMapper = modelToIndexMapperBuilder()
            .targetIndexType(WORK_INDEX_TYPE)
            .selectQuery(WORK_MODEL_TO_INDEX_DOCUMENT_QUERY)
            .mapFromResultVar("work").toJsonPath("work.uri")
            .mapFromResultVar("workTitle").toJsonPath("work.title")
            .mapFromResultVar("workYear").toJsonPath("work.year")
            .mapFromResultVar("creatorName").toJsonPath("work.creator.name")
            .mapFromResultVar("creator").toJsonPath("work.creator.uri")
            .mapFromResultVar("birth").toJsonPath("work.creator.birth")
            .mapFromResultVar("death").toJsonPath("work.creator.death")
            .build();


    private static final String PERSON_MODEL_TO_INDEX_DOCUMENT_QUERY = format("PREFIX  : <%1$s> \n"
            + "select distinct ?person ?personName ?birth ?death ?work ?workTitle ?workYear\n"
            + "where {\n"
            + "    ?person a :Person ;\n"
            + "             :name ?personName .\n"
            + "    optional {?person :birth ?birth.}\n"
            + "    optional {?person :death ?death.}\n"
            + "    optional {?work :creator ?person ;\n"
            + "                    :title ?workTitle .\n"
            + "              optional {?work :year ?workYear .}"
            + "              }\n"
            + "}\n", remote().ontology());

    private ModelToIndexMapper personModelToIndexMapper = modelToIndexMapperBuilder()
            .targetIndexType(PERSON_INDEX_TYPE)
            .selectQuery(PERSON_MODEL_TO_INDEX_DOCUMENT_QUERY)
            .mapFromResultVar("person").toJsonPath("person.uri")
            .mapFromResultVar("personName").toJsonPath("person.name")
            .mapFromResultVar("birth").toJsonPath("person.birth")
            .mapFromResultVar("death").toJsonPath("person.death")
            .mapFromResultVar("work").toJsonObjectArray("person.work").withObjectMember("uri")
            .mapFromResultVar("workTitle").toJsonObjectArray("person.work").withObjectMember("title")
            .mapFromResultVar("workYear").toJsonObjectArray("person.work").withObjectMember("year")
            .arrayGroupBy("work")
            .build();




    public SearchServiceImpl(String elasticSearchBaseUrl, RDFRepository rdfRepository, EntityService entityService) {
        this.rdfRepository = rdfRepository;
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
        doIndexWork(workId, false);
    }

    @Override
    public final void indexPerson(String personId) {
        doIndexPerson(personId, false);
    }

    @Override
    public final Response searchWork(String query) {
        return doSearch(query, workSearchUriBuilder);
    }

    @Override
    public final Response searchPerson(String query) {
        return doSearch(query, personSearchUriBuilder);
    }


    private void doIndexWork(String workId, boolean indexedPerson) {
        Model workModelWithLinkedResources = entityService.retrieveWorkWithLinkedResources(workId);
        indexModel(worksModelToIndexMapper.modelToIndexDocument(workModelWithLinkedResources), WORK_INDEX_TYPE);
        if (!indexedPerson) {
            Statement creatorProperty = workModelWithLinkedResources.getProperty(
                    createResource(remote().work() + workId),
                    CREATOR);
            if (creatorProperty != null) {
                String creatorUri = creatorProperty.getObject().asNode().getURI();
                doIndexPersonOnly(idFromEntityUri(creatorUri));
            }
        }
    }


    private void doIndexPerson(String personId, boolean indexedWork) {
        Model works = entityService.retrieveWorksByCreator(personId);
        if (!indexedWork) {
            ResIterator subjectIterator = works.listSubjects();
            while (subjectIterator.hasNext()) {
                String workUri = subjectIterator.next().toString();
                String workId = idFromEntityUri(workUri);
                doIndexWorkOnly(workId);
            }
        }
        Model personWithWorksModel = entityService.retrieveById(EntityType.PERSON, personId).add(works);
        indexModel(personModelToIndexMapper.modelToIndexDocument(personWithWorksModel), PERSON_INDEX_TYPE);
    }

    private void doIndexWorkOnly(String workId) {
        doIndexWork(workId, true);
    }

    private String idFromEntityUri(String uri) {
        return uri.substring(uri.lastIndexOf("/") + 1);
    }

    private void indexModel(Optional<Pair<String, String>> documentWithId, String indexType) {
        documentWithId.ifPresent(document -> indexDocument(indexType, document.getKey(), document.getValue()));
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
    private void doIndexPersonOnly(String personId) {
        doIndexPerson(personId, true);
    }
}
