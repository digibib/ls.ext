package no.deichman.services.entity;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
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
import org.apache.jena.rdf.model.impl.Util;
import org.apache.jena.riot.Lang;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Singleton;
import javax.servlet.ServletConfig;
import javax.ws.rs.BadRequestException;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.InternalServerErrorException;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;
import java.net.URI;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.CompletableFuture;

import static com.google.common.collect.Lists.newArrayList;
import static com.google.common.collect.Maps.newHashMap;
import static com.google.common.collect.Sets.newHashSet;
import static java.util.Collections.emptyList;
import static java.util.stream.Collectors.toMap;
import static javax.ws.rs.core.Response.accepted;
import static javax.ws.rs.core.Response.created;
import static javax.ws.rs.core.Response.noContent;
import static javax.ws.rs.core.Response.ok;
import static no.deichman.services.entity.EntityType.PUBLICATION;
import static no.deichman.services.entity.EntityType.WORK;
import static no.deichman.services.restutils.MimeType.DEFAULT;
import static no.deichman.services.restutils.MimeType.JSON;
import static no.deichman.services.restutils.MimeType.LDPATCH_JSON;
import static no.deichman.services.restutils.MimeType.LD_JSON;
import static no.deichman.services.restutils.MimeType.NTRIPLES;
import static no.deichman.services.restutils.MimeType.QS_0_7;
import static no.deichman.services.restutils.MimeType.TURTLE;

/**
 * Responsibility: Expose entities as r/w REST resources.
 */
@Singleton
@Path("/{type: " + EntityType.ALL_TYPES_PATTERN + " }")
public final class EntityResource extends ResourceBase {
    private final Logger log = LoggerFactory.getLogger(EntityResource.class);

    private static final Gson GSON = new GsonBuilder().setPrettyPrinting().create();

    public static final String RESOURCE_TYPE_PREFIXES_PATTERN = "p|w|h|g|c|s|e|m|i|t|v";
    @Context
    private ServletConfig servletConfig;
    public static final Map<String, String> PREFIX_MAP = newHashMap();

    static {
        PREFIX_MAP.put("role", "http://data.deichman.no/role#");
        PREFIX_MAP.put("xsd", "http://www.w3.org/2001/XMLSchema#");
        PREFIX_MAP.put("rdfs", "http://www.w3.org/2000/01/rdf-schema#");
        PREFIX_MAP.put("rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
        PREFIX_MAP.put("lvont", "http://lexvo.org/ontology#");
        PREFIX_MAP.put("audience", "http://data.deichman.no/audience#");
        PREFIX_MAP.put("binding", "http://data.deichman.no/binding#");
        PREFIX_MAP.put("biography", "http://data.deichman.no/biography#");
        PREFIX_MAP.put("duo", "http://data.deichman.no/utility#");
        PREFIX_MAP.put("classificationSource", "http://data.deichman.no/classificationSource#");
        PREFIX_MAP.put("adaptation", "http://data.deichman.no/contentAdaptation#");
        PREFIX_MAP.put("fictionNonfiction", "http://data.deichman.no/fictionNonfiction#");
        PREFIX_MAP.put("format", "http://data.deichman.no/format#");
        PREFIX_MAP.put("adaptation", "http://data.deichman.no/formatAdaptation#");
        PREFIX_MAP.put("illustrativeMatter", "http://data.deichman.no/illustrativeMatter#");
        PREFIX_MAP.put("key", "http://data.deichman.no/key#");
        PREFIX_MAP.put("literaryForm", "http://data.deichman.no/literaryForm#");
        PREFIX_MAP.put("mediaType", "http://data.deichman.no/mediaType#");
        PREFIX_MAP.put("nationality", "http://data.deichman.no/nationality#");
        PREFIX_MAP.put("ui", "http://data.deichman.no/ui#");
        PREFIX_MAP.put("relationType", "http://data.deichman.no/relationType#");
        PREFIX_MAP.put("workType", "http://data.deichman.no/workType#");
        PREFIX_MAP.put("writingSystem", "http://data.deichman.no/writingSystem#");
    }

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

    private Optional<String> checkForExistingImportedResource(String id, String type) {
        return getEntityService().retrieveImportedResource(id, type);
    }

    @GET
    @Path("/{id: (" + RESOURCE_TYPE_PREFIXES_PATTERN + ")[a-zA-Z0-9_]+}")
    @Produces(LD_JSON + MimeType.UTF_8 + DEFAULT)
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

    @GET
    @Path("/{id: (" + RESOURCE_TYPE_PREFIXES_PATTERN + ")[a-zA-Z0-9_]+}")
    @Produces({NTRIPLES + MimeType.UTF_8 + QS_0_7, TURTLE + MimeType.UTF_8 + QS_0_7})
    public Response getNtriples(@PathParam("type") String type, @PathParam("id") String id, @HeaderParam("Accept") String acceptHeader) throws Exception {
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
        tidyUpPrefixesForModel(model);
        return ok().entity(RDFModelUtil.stringFrom(model, acceptHeader.startsWith(NTRIPLES) ? Lang.NTRIPLES : Lang.TURTLE)).build();
    }

    private void tidyUpPrefixesForModel(Model model) {
        model.getNsPrefixMap().entrySet().forEach(e -> model.removeNsPrefix(e.getKey()));
        model.setNsPrefixes(PREFIX_MAP);
        Set<String> nameSpacesInUse = newHashSet();
        model.listStatements().forEachRemaining(
                s -> nameSpacesInUse.addAll(
                        newArrayList(
                                s.getSubject().getNameSpace(),
                                s.getPredicate().getNameSpace(),
                                s.getObject().isResource() ? s.getObject().asResource().getNameSpace() : dataTypeUriNamespace(s.getObject()))));
        model.getNsPrefixMap()
                .entrySet()
                .forEach(
                        ns -> {
                            if (!nameSpacesInUse.contains(ns.getValue())) {
                                model.removeNsPrefix(ns.getKey());
                            }
                        }
                );
        model.setNsPrefix("", BaseURI.ontology());
    }

    private String dataTypeUriNamespace(RDFNode object) {
        String datatypeURI = object.asLiteral().getDatatypeURI();
        return datatypeURI.substring(0, Util.splitNamespaceXML(datatypeURI));
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
            String recordId = model.listObjectsOfProperty(ResourceFactory.createProperty(BaseURI.ontology("recordId"))).next().asLiteral().getString();
            getKohaAdapter().deleteBiblio(recordId);
            getEntityService().delete(model);
            Set<String> connectedResources = getEntityService().retrieveResourcesConnectedTo(xuri);
            getEntityService().deleteIncomingRelations(xuri);
            getSearchService().delete(xuri);
            getSearchService().enqueueIndexing(connectedResources, xuri);
            Iterator<RDFNode> sourceIterator = model.listObjectsOfProperty(ResourceFactory.createProperty(BaseURI.ontology("publicationOf")));
            while (sourceIterator.hasNext()) {
                String publicationOf = sourceIterator.next().asResource().getURI();
                try {
                    getSearchService().index(new XURI(publicationOf));
                } catch (RuntimeException e) {
                    // Will fail if massaged model is empty, but that shouldn't cause this delete request to fail
                }
            }
        } else {
            getEntityService().delete(model);
            Set<String> connectedResources = getEntityService().retrieveResourcesConnectedTo(xuri);
            getEntityService().deleteIncomingRelations(xuri);
            getSearchService().delete(xuri);
            getSearchService().enqueueIndexing(connectedResources, xuri);
        }

        getSearchService().delete(xuri);

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
                xuri = new XURI(workUri);
            }
        }
        try {
            getSearchService().index(xuri);
        } catch (RuntimeException e) {
            log.error("Failed to index uri " + xuri.getUri(), e);
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

    @PUT
    @Path("/sync_all")
    public Response syncAll(@PathParam("type") final String type, @PathParam("id") String id) throws Exception {
        if (!type.equals("publication")) {
            throw new BadRequestException("can only sync all on publication");
        }
        CompletableFuture.runAsync(() -> {
            getEntityService().retrieveAllWorkUris(type, uri -> {
                try {
                    getEntityService().synchronizeKoha(new XURI(uri));
                } catch (Exception e) {
                    e.printStackTrace();
                }
            });
        });
        return accepted().build();
    }

    @GET
    @Path("{creatorId: h[a-zA-Z0-9_]+}/works")
    public Response getWorksByCreator(@PathParam("type") String type, @PathParam("creatorId") String creatorId) throws Exception {
        XURI xuri = new XURI(BaseURI.root(), type, creatorId);
        return zeroOrMoreResponseFromModel(getEntityService().retrieveWorksByCreator(xuri));
    }

    @GET
    @Path("{id: (g|w|h|e|c|s)[a-zA-Z0-9_]+}/asSubjectOfWorks")
    public Response getWorksWhereUriIsSubject(@PathParam("type") final String type,
                                              @PathParam("id") String id,
                                              @QueryParam("maxSize") @DefaultValue("100") int maxSize) throws Exception {
        XURI xuri = new XURI(BaseURI.root(), type, id);
        return getSearchService().searchWorkWhereUriIsSubject(xuri.getUri(), maxSize);
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

    @GET
    @Path("{id: w[a-zA-Z0-9_]+}/listRecordIds")
    @Produces(JSON + MimeType.UTF_8)
    public Response getWorkRecordIds(@PathParam("type") String type, @PathParam("id") String id) throws Exception {
        XURI xuri = new XURI(BaseURI.root(), type, id);
        HashMap<String, List<String>> recordIds = new HashMap<>();
        recordIds.put("recordIds", getEntityService().retrieveWorkRecordIds(xuri));
        return ok().entity(GSON.toJson(recordIds)).build();
    }

    @GET
    @Path("{id: (" + RESOURCE_TYPE_PREFIXES_PATTERN + ")[a-zA-Z0-9_]+}/references")
    @Produces(JSON + MimeType.UTF_8)
    public Response getNumberOfRelationsForResource(@PathParam("type") String type, @PathParam("id") String id) throws Exception {
        XURI xuri = new XURI(BaseURI.root(), type, id);
        return ok().entity(GSON.toJson(getEntityService().getNumberOfRelationsForResource(xuri))).build();
    }

    @GET
    @Produces(LD_JSON)
    public Response retrieveResourceByQuery(@PathParam("type") String type, @Context UriInfo uriInfo) throws Exception {
        Map<String, List<String>> queryParameters = uriInfo.getQueryParameters().entrySet().stream().collect(toMap(Map.Entry::getKey, Map.Entry::getValue));
        List<String> projections = Optional.ofNullable(queryParameters.remove("@return")).orElse(emptyList());
        Map<String, String> queryParamsSingleValue = queryParameters.entrySet().stream().collect(toMap(Map.Entry::getKey, v -> v.getValue().get(0)));
        Model model = getEntityService().retrieveResourceByQuery(EntityType.get(type), queryParamsSingleValue, projections);
        return ok().entity(getJsonldCreator().asJSONLD(model)).build();
    }

    @GET
    @Path("/isbn/{isbn: [0-9Xx-]+}")
    @Produces(LD_JSON)
    public Response describePublicationFromParsedCoreISBNQuery(@PathParam("isbn") String isbn) throws Exception {
        Model model = getEntityService().describePublicationFromParsedCoreISBNQuery(isbn);
        return ok().entity(getJsonldCreator().asJSONLD(model)).build();
    }

    @GET
    @Path("{id: (" + RESOURCE_TYPE_PREFIXES_PATTERN + ")[a-zA-Z0-9_]+}/relations")
    @Produces(JSON)
    public Response retriveResourceParticipations(@PathParam("type") String type, @PathParam("id") String id) throws Exception {
        XURI xuri = new XURI(BaseURI.root(), type, id);
        return ok().entity(GSON.toJson(getEntityService().retrieveResourceRelationships(xuri))).build();
    }

    @PUT
    @Consumes(JSON)
    @Path("{id: (" + RESOURCE_TYPE_PREFIXES_PATTERN + ")[a-zA-Z0-9_]+}/merge")
    public Response mergeNodes(@PathParam("type") String type, @PathParam("id") String id, String jsonReplacee) throws Exception {
        XURI outgoing;
        XURI staying = new XURI(BaseURI.root(), type, id);
        if (!getEntityService().resourceExists(staying)) {
            throw new NotFoundException();
        }

        try {
            Replacee replaceeData = GSON.fromJson(jsonReplacee, Replacee.class);
            outgoing = replaceeData.getReplacee();
        } catch (Exception exception) {
            throw new BadRequestException();
        }

        if (!staying.equals(outgoing)) {
            try {
                List<XURI> relatedUris = getEntityService().retrieveResourceRelationshipsUris(outgoing);
                getEntityService().mergeResource(staying, outgoing);
                getEntityService().removeFromLocalIndex(outgoing);
                final SearchService searchService = getSearchService();
                searchService.delete(outgoing);
                relatedUris.forEach(searchService::index);
            } catch (Exception e) {
                e.printStackTrace();
                throw new InternalServerErrorException(e);
            }
        }

        return Response.noContent().build();
    }

    @GET
    @Path("{id: (" + RESOURCE_TYPE_PREFIXES_PATTERN + ")[a-zA-Z0-9_]+}/inverseRelationsBy/{predicate}")
    @Produces(JSON)
    public Response retrieveInverseRelationsBy(@PathParam("type") String type,
                                               @PathParam("id") String id,
                                               @PathParam("predicate") String predicate,
                                               @QueryParam("projection") final List<String> projections) {
        XURI xuri = null;
        try {
            xuri = new XURI(BaseURI.root(), type, id);
        } catch (Exception e) {
            throw new BadRequestException(e);
        }
        return ok().entity(GSON.toJson(getEntityService().retrieveInverseRelations(xuri, predicate, projections))).build();
    }

    @POST
    @Path("{id: (" + RESOURCE_TYPE_PREFIXES_PATTERN + ")[a-zA-Z0-9_]+}/clone")
    public Response cloneResource(@PathParam("type") String type,
                                  @PathParam("id") String id){
        try {
            XURI xuri = new XURI(BaseURI.root(), type, id);
            final Model model = getEntityService().retrieveById(xuri);
            if (model.isEmpty()) {
                throw new NotFoundException();
            }
            model.add(ResourceFactory.createStatement(
                    ResourceFactory.createResource(xuri.getUri()),
                    ResourceFactory.createProperty("http://migration.deichman.no/clonedFrom"),
                    ResourceFactory.createResource(xuri.getUri())));
            return created(URI.create(getEntityService().create(EntityType.get(type), model))).build();
        } catch (Exception e) {
            throw new BadRequestException(e);
        }
    }
}
