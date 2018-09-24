package no.deichman.services.entity;

import no.deichman.services.entity.kohaadapter.KohaAdapter;
import no.deichman.services.ontology.AuthorizedValue;
import no.deichman.services.rdf.DefaultPrefixes;
import no.deichman.services.rdf.JSONLDCreator;
import no.deichman.services.search.SearchService;
import no.deichman.services.uridefaults.BaseURI;
import org.apache.commons.lang3.StringUtils;
import org.apache.jena.rdf.model.Model;

import javax.inject.Singleton;
import javax.servlet.ServletConfig;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;

import static no.deichman.services.restutils.MimeType.LD_JSON;
import static no.deichman.services.restutils.MimeType.UTF_8;

/**
 * Responsibility: Handle requests for authorized values.
 */
@Singleton
@Path("authorized_values")
public final class AuthorizedValuesResource extends ResourceBase {
    @Context
    private ServletConfig servletConfig;

    public AuthorizedValuesResource() {}

    AuthorizedValuesResource(EntityService entityService, SearchService searchService, KohaAdapter kohaAdapter) {
        super(entityService, searchService, kohaAdapter);
    }


    @GET
    @Path("{type:" + AuthorizedValue.ALL_TYPES_PATTERN + "}")
    @Produces(LD_JSON + UTF_8)
    public Response getAuthorizedValues(@PathParam("type") String type) {
        Model model = getEntityService().retrieveAuthorizedValuesFor(StringUtils.capitalize(type));
        DefaultPrefixes ctx = new DefaultPrefixes(BaseURI.ontology());
        return Response.ok().entity(new JSONLDCreator().asJSONLD(model, ctx.getForAuthorizedValues())).build();
    }

    @Override
    protected ServletConfig getConfig() {
        return servletConfig;
    }
}
