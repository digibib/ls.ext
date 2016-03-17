package no.deichman.services.entity;

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
import java.util.List;
import java.util.Optional;

import static javax.ws.rs.core.Response.accepted;
import static javax.ws.rs.core.Response.noContent;
import static javax.ws.rs.core.Response.ok;
import static no.deichman.services.entity.EntityType.WORK;
import static no.deichman.services.restutils.MimeType.LDPATCH_JSON;
import static no.deichman.services.restutils.MimeType.LD_JSON;
import static no.deichman.services.restutils.MimeType.NTRIPLES;

/**
 * Responsibility: Expose entitites as r/w REST resources.
 */
@Singleton
@Path("/{type: " + EntityType.ALL_TYPES_PATTERN + " }")
public final class EntityResource extends ResourceBase {

    @Context
    private ServletConfig servletConfig;

    public EntityResource() {
    }

    EntityResource(BaseURI baseURI, EntityService entityService, SearchService searchService) {
        setBaseURI(baseURI);
        setEntityService(entityService);
        setSearchService(searchService);
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
        Response.ResponseBuilder rb = null;
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
        if (nodeList.size() > 0) {
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
    @Path("/{id: (p|w|h|g|i)[a-zA-Z0-9_]+}")
    @Produces(LD_JSON + MimeType.UTF_8)
    public Response get(@PathParam("type") String type, @PathParam("id") String id) throws Exception {
        Model model;
        XURI xuri = new XURI(getBaseURI().getBaseUriRoot(), type, id);

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
    @Path("/{id: (p|w|h|g|i)[a-zA-Z0-9_]+}")
    public Response delete(@PathParam("type") String type, @PathParam("id") String id) throws Exception {
        XURI xuri = new XURI(getBaseURI().getBaseUriRoot(), type, id);

        Model model = getEntityService().retrieveById(xuri);

        if (model.isEmpty()) {
            throw new NotFoundException();
        }
        getEntityService().delete(model);
        return noContent().build();
    }

    @PATCH
    @Path("/{id: (p|w|h|g|i)[a-zA-Z0-9_]+}")
    @Consumes(LDPATCH_JSON)
    @Produces(LD_JSON + MimeType.UTF_8)
    public Response patch(@PathParam("type") String type, @PathParam("id") String id, String jsonLd) throws Exception {
        XURI xuri = new XURI(getBaseURI().getBaseUriRoot(), type, id);

        if (StringUtils.isBlank(jsonLd)) {
            throw new BadRequestException("Empty json body");
        }

        if (!getEntityService().resourceExists(xuri)) {
            throw new NotFoundException();
        }
        Model m;
        try {
            m = getEntityService().patch(xuri.getTypeAsEntityType(), xuri.getId(), jsonLd);
        } catch (PatchParserException e) {
            throw new BadRequestException(e);
        }

        switch (xuri.getTypeAsEntityType()) {
            case WORK:
                getSearchService().indexWork(xuri.getId());
                break;
            case PERSON:
                getSearchService().indexPerson(xuri.getId());
                break;
            case PLACE_OF_PUBLICATION:
                getSearchService().indexPlaceOfPublication(xuri.getId());
                break;
            case PUBLICATION:
                Property publicationOfProperty = ResourceFactory.createProperty(getBaseURI().ontology("publicationOf"));
                if (m.getProperty(null, publicationOfProperty) != null) {
                    String workUri = m.getProperty(null, publicationOfProperty).getObject().toString();
                    XURI workXURI = new XURI(workUri);

                    getSearchService().indexWork(workXURI.getId());
                }
                break;
            case PUBLISHER:
                getSearchService().indexPublisher(xuri.getId());
                break;
            default:
                break;
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
    public Response getWorkItems(@PathParam("workId") String workId, @PathParam("type") String type) {
        return zeroOrMoreResponseFromModel(getEntityService().retrieveWorkItemsById(workId));
    }

    @PUT
    @Path("{id: (h|w)[a-zA-Z0-9_]+}/index")
    public Response index(@PathParam("type") final String type, @PathParam("id") String id) throws Exception {
        XURI xuri = new XURI(getBaseURI().getBaseUriRoot(), type, id);
        switch (xuri.getTypeAsEntityType()) {
            case WORK:
                getSearchService().indexWork(xuri.getId());
                break;
            case PERSON:
                getSearchService().indexPerson(xuri.getId());
                break;
            default: /* will never get to here */
                break;
        }
        return accepted().build();
    }

    @PUT
    @Path("{id: (p|w|h)[a-zA-Z0-9_]+}/sync")
    public Response sync(@PathParam("type") final String type, @PathParam("id") String id) throws Exception {
        XURI xuri = new XURI(getBaseURI().getBaseUriRoot(), type, id);
        getEntityService().synchronizeKoha(xuri.getTypeAsEntityType(), xuri.getId());
        return accepted().build();
    }

    @GET
    @Path("{creatorId: h[a-zA-Z0-9_]+}/works")
    public Response getWorksByCreator(@PathParam("creatorId") String creatorId) {
        return zeroOrMoreResponseFromModel(getEntityService().retrieveWorksByCreator(creatorId));
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
