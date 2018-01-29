package no.deichman.services.entity;

import no.deichman.services.entity.kohaadapter.KohaAdapter;
import no.deichman.services.entity.kohaadapter.KohaAdapterImpl;
import no.deichman.services.entity.repository.InMemoryRepository;
import no.deichman.services.entity.repository.RDFRepository;
import no.deichman.services.entity.repository.RemoteRepository;
import no.deichman.services.rdf.JSONLDCreator;
import no.deichman.services.search.SearchService;
import no.deichman.services.search.SearchServiceImpl;
import no.deichman.services.uridefaults.BaseURI;

import javax.servlet.ServletConfig;
import javax.ws.rs.core.Context;
import java.util.Optional;

/**
 * Responsibility: Common logic for handling dependencies.
 */
public abstract class ResourceBase {

    public static final String SERVLET_INIT_PARAM_KOHA_PORT = "kohaPort";
    public static final String SERVLET_INIT_PARAM_IN_MEMORY_RDF_REPOSITORY = "inMemoryRDFRepository";
    public static final String ELASTIC_SEARCH_URL = "elasticsearch.url";
    public static final String Z3950_ENDPOINT = "z3950Endpoint";
    private EntityService entityService;
    private SearchService searchService;
    private KohaAdapter kohaAdapter;

    public ResourceBase() {
    }

    protected ResourceBase(EntityService entityService, SearchService searchService, KohaAdapter kohaAdapter) {
        this.entityService = entityService;
        this.searchService = searchService;
        this.kohaAdapter = kohaAdapter;
    }

    private String elasticSearchBaseUrl() {
        return Optional.ofNullable(getConfig() != null ? getConfig().getInitParameter(ELASTIC_SEARCH_URL) : null).orElse("http://elasticsearch:9200");
    }

    private static InMemoryRepository staticInMemoryRepository;
    @Context
    private ServletConfig servletConfig;
    private BaseURI baseURI;
    private JSONLDCreator jsonldCreator;

    protected abstract ServletConfig getConfig();

    protected final EntityService getEntityService() {
        if (entityService == null) {
            RDFRepository repository = getRdfRepository();
            entityService = new EntityServiceImpl(repository, getKohaAdapter());
        }
        return entityService;
    }

    public static InMemoryRepository getInMemoryRepository() {
        if (staticInMemoryRepository == null) {
            staticInMemoryRepository = new InMemoryRepository();
        }
        return staticInMemoryRepository;
    }

    private RDFRepository getRdfRepository() {
        RDFRepository repository;
        if (getConfig() != null && "true".equals(getConfig().getInitParameter(SERVLET_INIT_PARAM_IN_MEMORY_RDF_REPOSITORY))) {
            if (staticInMemoryRepository == null) {
                staticInMemoryRepository = new InMemoryRepository();
            }
            repository = staticInMemoryRepository;
        } else {
            repository = new RemoteRepository();
        }
        return repository;
    }

    protected final KohaAdapter getKohaAdapter() {
        if (kohaAdapter == null) {
            kohaAdapter = new KohaAdapterImpl(getConfig() != null ? getConfig().getInitParameter(SERVLET_INIT_PARAM_KOHA_PORT) : null);
        }
        return kohaAdapter;
    }

    protected final JSONLDCreator getJsonldCreator() {
        if (jsonldCreator == null) {
            jsonldCreator = new JSONLDCreator();
        }
        return jsonldCreator;
    }

    final void setEntityService(EntityService entityService) {
        this.entityService = entityService;
    }

    protected final void setSearchService(SearchService searchService) {
        this.searchService = searchService;
    }

    protected final void setBaseURI(BaseURI baseURI) {
        this.baseURI = baseURI;
    }

    public final SearchService getSearchService() {
        if (searchService == null) {
            searchService = new SearchServiceImpl(elasticSearchBaseUrl(), getEntityService());
        }
        return searchService;
    }

    public final SearchService getBootstrapSearchService() {
        return  new SearchServiceImpl(elasticSearchBaseUrl());
    }

    public final void setKohaAdapter(KohaAdapter kohaAdapter) {
        this.kohaAdapter = kohaAdapter;
    }
}
