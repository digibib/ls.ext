package no.deichman.services.entity;

import com.jamonapi.proxy.MonProxyFactory;
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

    protected final String elasticSearchBaseUrl() {
        return Optional.ofNullable(getConfig() != null ? getConfig().getInitParameter(ELASTIC_SEARCH_URL) : null).orElse("http://localhost:9200");
    }

    private static InMemoryRepository staticInMemoryRepository;
    @Context
    private ServletConfig servletConfig;
    private EntityService entityService;
    private BaseURI baseURI;
    private JSONLDCreator jsonldCreator;
    private SearchService searchService;

    protected abstract ServletConfig getConfig();

    protected final EntityService getEntityService() {
        if (entityService == null) {
            KohaAdapter kohaAdapter = getKohaAdapter();
            RDFRepository repository = getRdfRepository();
            entityService = new EntityServiceImpl(getBaseURI(), repository, kohaAdapter);
        }
        return entityService;
    }

    private RDFRepository getRdfRepository() {
        RDFRepository repository;
        if (getConfig() != null && "true".equals(getConfig().getInitParameter(SERVLET_INIT_PARAM_IN_MEMORY_RDF_REPOSITORY))) {
            if (staticInMemoryRepository == null) {
                staticInMemoryRepository = new InMemoryRepository(getBaseURI());
            }
            repository = staticInMemoryRepository;
        } else {
            repository = new RemoteRepository();
        }
        return repository;
    }

    protected final KohaAdapter getKohaAdapter() {
        return (KohaAdapter) MonProxyFactory.monitor(new KohaAdapterImpl(getConfig() != null ? getConfig().getInitParameter(SERVLET_INIT_PARAM_KOHA_PORT) : null));
    }

    protected final BaseURI getBaseURI() {
        if (baseURI == null) {
            baseURI = BaseURI.remote();
        }
        return baseURI;
    }

    protected final JSONLDCreator getJsonldCreator() {
        if (jsonldCreator == null) {
            jsonldCreator = new JSONLDCreator(getBaseURI());
        }
        return jsonldCreator;
    }
    protected final void setEntityService(EntityService entityService) {
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
            searchService = new SearchServiceImpl(elasticSearchBaseUrl(), getRdfRepository(), getEntityService());
        }
        return searchService;
    }
}
