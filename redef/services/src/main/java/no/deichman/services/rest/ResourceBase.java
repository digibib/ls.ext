package no.deichman.services.rest;

import javax.servlet.ServletConfig;
import no.deichman.services.kohaadapter.KohaAdapter;
import no.deichman.services.kohaadapter.KohaAdapterImpl;
import no.deichman.services.repository.InMemoryRepository;
import no.deichman.services.repository.RDFRepository;
import no.deichman.services.repository.RemoteRepository;
import no.deichman.services.rdf.JSONLDCreator;
import no.deichman.services.service.EntityService;
import no.deichman.services.service.EntityServiceImpl;
import no.deichman.services.uridefaults.BaseURI;

/**
 * Responsibility: Common logic for handling dependencies.
 */
public abstract class ResourceBase {

    public static final String SERVLET_INIT_PARAM_KOHA_PORT = "kohaPort";
    public static final String SERVLET_INIT_PARAM_IN_MEMORY_RDF_REPOSITORY = "inMemoryRDFRepository";

    private static InMemoryRepository staticInMemoryRepository;
    private EntityService entityService;
    private BaseURI baseURI;
    private JSONLDCreator jsonldCreator;

    abstract ServletConfig getConfig();

    protected final EntityService getEntityService() {
        if (entityService == null) {
            KohaAdapter kohaAdapter = new KohaAdapterImpl(getConfig() != null ? getConfig().getInitParameter(SERVLET_INIT_PARAM_KOHA_PORT) : null);
            RDFRepository repository;
            if (getConfig() != null && "true".equals(getConfig().getInitParameter(SERVLET_INIT_PARAM_IN_MEMORY_RDF_REPOSITORY))) {
                if (staticInMemoryRepository == null) {
                    staticInMemoryRepository = new InMemoryRepository(getBaseURI());
                }
                repository = staticInMemoryRepository;
            } else {
                repository = new RemoteRepository();
            }
            entityService = new EntityServiceImpl(getBaseURI(), repository, kohaAdapter);
        }
        return entityService;
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

    protected final void setBaseURI(BaseURI baseURI) {
        this.baseURI = baseURI;
    }

}
