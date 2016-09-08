package no.deichman.services.entity;

import no.deichman.services.entity.kohaadapter.KohaAdapter;
import no.deichman.services.entity.patch.PatchParserException;
import no.deichman.services.rdf.RDFModelUtil;
import no.deichman.services.restutils.MimeType;
import no.deichman.services.restutils.PATCH;
import no.deichman.services.search.SearchService;
import no.deichman.services.uridefaults.BaseURI;
import no.deichman.services.uridefaults.XURI;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.text.WordUtils;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.NodeIterator;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.ResourceFactory;
import org.apache.jena.riot.Lang;

import javax.inject.Singleton;
import javax.servlet.ServletConfig;
import javax.ws.rs.BadRequestException;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;
import java.net.URI;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;

import static javax.ws.rs.core.Response.accepted;
import static javax.ws.rs.core.Response.noContent;
import static javax.ws.rs.core.Response.ok;
import static no.deichman.services.entity.EntityType.PUBLICATION;
import static no.deichman.services.entity.EntityType.WORK;
import static no.deichman.services.restutils.MimeType.LDPATCH_JSON;
import static no.deichman.services.restutils.MimeType.LD_JSON;
import static no.deichman.services.restutils.MimeType.NTRIPLES;

/**
 * Responsibility: Expose entities as r/w REST resources.
 */
@Singleton
@Path("/{type: " + EntityType.ALL_TYPES_PATTERN + " }")
public final class EntityResource extends ResourceBase {

    public static final String RESOURCE_TYPE_PREFIXES_PATTERN = "p|w|h|g|c|s|e|m|i|t|v";
    @Context
    private ServletConfig servletConfig;

    public EntityResource() {
    }

    EntityResource(EntityService entityService, SearchService searchService, KohaAdapter kohaAdapter) {
        super(entityService, searchService, kohaAdapter);
    }

    @POST
    @Consumes(LD_JSON)
    public Response createFromLDJSON(@PathParam("type") String type, String body) throws Exception {
        return create(type, body, Lang.JSONLD);
    }

    @POST
    @Consumes(NTRIPLES)
    public Response createFromNTriples(@PathParam("type") String type, String body) throws Exception {
        return create(type, body, Lang.NTRIPLES);
    }

    private Response create(String type, String body, Lang lang) throws Exception {
        Response.ResponseBuilder rb;
        String canonicalTypeId = WordUtils.capitalize(type);

        Optional<String> message = Optional.empty();
        Optional<String> uri = Optional.empty();
        Response.Status status;
        String bibliofilId = null;

        Model model = RDFModelUtil.modelFrom(body, lang);
        NodeIterator nodes = model.listObjectsOfProperty(ResourceFactory.createProperty("http://data.deichman.no/duo#bibliofil" + canonicalTypeId + "Id"));
        List<RDFNode> nodeList = nodes.toList();

        if (nodeList.size() > 1) {
            message = Optional.of("Request with greater than one bibliofil " + type + " authority ID per resource");
            status = Response.Status.BAD_REQUEST;
        }
        if (nodeList.size() > 0 && nodeList.size() < 2) {
            bibliofilId = nodeList.get(0).asLiteral().toString();
            if (checkForExistingImportedResource(bibliofilId, canonicalTypeId).isPresent()) {
                uri = checkForExistingImportedResource(bibliofilId, canonicalTypeId);
            }
        }

        if (uri.isPresent()) {
            status = Response.Status.CONFLICT;
            message = Optional.of("Resource with ID <" + uri.get() + "> was found to have Bibliofil ID " + bibliofilId);
        } else {
            uri = Optional.of(getEntityService().create(EntityType.get(type), model));
            status = Response.Status.CREATED;
        }
        rb = Response.status(status);
        rb.location(new URI(uri.get()));
        if (message.isPresent()) {
            rb.entity(message.get());
        }

        return rb.build();

    }

    private Optional<String>  checkForExistingImportedResource(String id, String type) {
        return getEntityService().retrieveImportedResource(id, type);
    }

    @GET
    @Path("/{id: (" + RESOURCE_TYPE_PREFIXES_PATTERN + ")[a-zA-Z0-9_]+}")
    @Produces(LD_JSON + MimeType.UTF_8)
    public Response get(@PathParam("type") String type, @PathParam("id") String id) throws Exception {
        Model model;
        XURI xuri = new XURI(BaseURI.root(), type, id);

        if ("work".equals(type)) {
            model = getEntityService().retrieveWorkWithLinkedResources(xuri);
        } else if ("person".equals(type)) {
            model = getEntityService().retrievePersonWithLinkedResources(xuri);
        } else {
            model = getEntityService().retrieveById(xuri);
        }
        if (model.isEmpty()) {
            throw new NotFoundException();
        }
        return ok().entity(getJsonldCreator().asJSONLD(model)).build();
    }

    @DELETE
    @Path("/{id: (" + RESOURCE_TYPE_PREFIXES_PATTERN + ")[a-zA-Z0-9_]+}")
    public Response delete(@PathParam("type") String type, @PathParam("id") String id) throws Exception {
        XURI xuri = new XURI(BaseURI.root(), type, id);

        Model model = getEntityService().retrieveById(xuri);

        if (model.isEmpty()) {
            throw new NotFoundException();
        }
        if (xuri.getTypeAsEntityType() == PUBLICATION) {
            String recordID = model.listObjectsOfProperty(ResourceFactory.createProperty(BaseURI.ontology("recordID"))).next().asLiteral().getString();
            getKohaAdapter().deleteBiblio(recordID);
            getEntityService().delete(model);
            getSearchService().delete(xuri);
            Iterator<RDFNode> sourceIterator = model.listObjectsOfProperty(ResourceFactory.createProperty(BaseURI.ontology("publicationOf")));
            while (sourceIterator.hasNext()) {
                String publicationOf = sourceIterator.next().asResource().getURI();
                getSearchService().index(new XURI(publicationOf));
            }
        } else {
            getEntityService().delete(model);
            getSearchService().delete(xuri);
        }
        return noContent().build();
    }

    @PATCH
    @Path("/{id: (" + RESOURCE_TYPE_PREFIXES_PATTERN + ")[a-zA-Z0-9_]+}")
    @Consumes(LDPATCH_JSON)
    @Produces(LD_JSON + MimeType.UTF_8)
    public Response patch(@PathParam("type") String type, @PathParam("id") String id, String jsonLd) throws Exception {
        XURI xuri = new XURI(BaseURI.root(), type, id);

        if (StringUtils.isBlank(jsonLd)) {
            throw new BadRequestException("Empty json body");
        }

        if (!getEntityService().resourceExists(xuri)) {
            throw new NotFoundException();
        }
        Model m;
        try {
            m = getEntityService().patch(xuri, jsonLd);
        } catch (PatchParserException e) {
            throw new BadRequestException(e);
        }

        if (xuri.getTypeAsEntityType() == PUBLICATION) {
            Property publicationOfProperty = ResourceFactory.createProperty(BaseURI.ontology("publicationOf"));
            if (m.getProperty(null, publicationOfProperty) != null) {
                String workUri = m.getProperty(null, publicationOfProperty).getObject().toString();
                XURI workXURI = new XURI(workUri);

                getSearchService().index(workXURI);
                getSearchService().index(xuri);
            }
        } else {
            getSearchService().index(xuri);
        }

        return ok().entity(getJsonldCreator().asJSONLD(m)).build();
    }

    @PUT
    @Consumes(LD_JSON)
    public Response update(@PathParam("type") String type, String work) {
        EntityType entityType = EntityType.get(type);
        if (entityType != WORK) {
            throw new NotFoundException("PUT unsupported on this resource");
        }
        getEntityService().updateWork(work);
        return ok().build();
    }

    @GET
    @Path("/{workId: w[a-zA-Z0-9_]+}/items")
    @Produces(LD_JSON + MimeType.UTF_8)
    public Response getWorkItems(@PathParam("workId") String workId, @PathParam("type") String type) throws Exception {
        XURI xuri = new XURI(BaseURI.root(), EntityType.WORK.getPath(), workId);
        return zeroOrMoreResponseFromModel(getEntityService().retrieveWorkItemsByURI(xuri));
    }

    @PUT
    @Path("{id: (h|w)[a-zA-Z0-9_]+}/index")
    public Response index(@PathParam("type") final String type, @PathParam("id") String id) throws Exception {
        XURI xuri = new XURI(BaseURI.root(), type, id);
        getSearchService().index(xuri);
        return accepted().build();
    }

    @PUT
    @Path("{id: (p|w|h)[a-zA-Z0-9_]+}/sync")
    public Response sync(@PathParam("type") final String type, @PathParam("id") String id) throws Exception {
        XURI xuri = new XURI(BaseURI.root(), type, id);
        getEntityService().synchronizeKoha(xuri);
        return accepted().build();
    }

    @GET
    @Path("{creatorId: h[a-zA-Z0-9_]+}/works")
    public Response getWorksByCreator(@PathParam("type") String type, @PathParam("creatorId") String creatorId) throws Exception {
        XURI xuri = new XURI(BaseURI.root(), type, creatorId);
        return zeroOrMoreResponseFromModel(getEntityService().retrieveWorksByCreator(xuri));
    }

    @GET
    @Path("{id: (p|w|h|e)[a-zA-Z0-9_]+}/asSubjectOfWorks")
    public Response getWorksWhereUriIsSubject(@PathParam("type") final String type, @PathParam("id") String id) throws Exception {
        XURI xuri = new XURI(BaseURI.root(), type, id);
        return getSearchService().searchWork("work.subject.uri:\"" + xuri.getUri() + "\"");
    }

    @Override
    protected ServletConfig getConfig() {
        return servletConfig;
    }

    private Response zeroOrMoreResponseFromModel(Model model) {
        return (model.isEmpty()
                ? noContent()
                : ok().entity(getJsonldCreator().asJSONLD(model)))
                .build();
    }

}
