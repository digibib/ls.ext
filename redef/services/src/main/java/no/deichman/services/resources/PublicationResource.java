package no.deichman.services.resources;

import java.net.URI;
import java.net.URISyntaxException;

import javax.ws.rs.BadRequestException;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.OPTIONS;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;

import com.hp.hpl.jena.rdf.model.Model;

import no.deichman.services.kohaadapter.KohaAdapter;
import no.deichman.services.repository.Repository;
import no.deichman.services.service.Service;
import no.deichman.services.service.ServiceDefault;
import no.deichman.services.uridefaults.BaseURI;
import no.deichman.services.uridefaults.BaseURIDefault;
import no.deichman.services.utils.CORSProvider;
import no.deichman.services.utils.JSONLD;
import no.deichman.services.utils.MimeType;
import no.deichman.services.utils.PATCH;

@Path("/publication")
public class PublicationResource {

    private static final String MIME_JSONLD = MimeType.JSONLD;
    private static final String ENCODING_UTF8 = "; charset=utf-8";

    private final Service service;
    private BaseURI baseURI;
    private JSONLD jsonld;
    private CORSProvider cors;

    public PublicationResource() {
        super();
        baseURI = new BaseURIDefault();
        jsonld = new JSONLD(baseURI);
        service = new ServiceDefault(baseURI);
        cors = new CORSProvider();
    }

    public PublicationResource(KohaAdapter kohaAdapter, Repository repository, BaseURI b) {
        super();
        ServiceDefault serviceDefault = new ServiceDefault(b);
        serviceDefault.setKohaAdapter(kohaAdapter);
        serviceDefault.setRepository(repository);
        service = serviceDefault;
        baseURI = b;
        jsonld = new JSONLD(b);
        cors = new CORSProvider();
    }

    @POST
    @Consumes(MIME_JSONLD) 
    public Response createPublication(String publication) throws URISyntaxException {
        String workId = service.createPublication(publication);
        URI location = new URI(workId);

        return Response.created(location)
                       .header("Access-Control-Allow-Origin", "*")
                       .header("Access-Control-Allow-Methods", "POST")
                       .header("Access-Control-Expose-Headers", "Location")
                       .allow("OPTIONS")
                       .build();
    }

    @GET
    @Path("/{publicationId: [a-zA-Z0-9_]+}")
    @Produces(MIME_JSONLD + ENCODING_UTF8)
    public Response getPublicationJSON(@PathParam("publicationId") String publicationId) {
        Model model = service.retrievePublicationById(publicationId);

        if (model.isEmpty()) {
            throw new NotFoundException();
        }

        return Response.ok().entity(jsonld.getJson(model))
                            .header("Access-Control-Allow-Origin", "*")
                            .header("Access-Control-Allow-Methods", "GET")
                            .allow("OPTIONS")
                            .build();
    }

    @DELETE
    @Path("/{publicationId: [a-zA-Z0-9_]+}")
    public Response deletePublication(@PathParam("publicationId") String publicationId) {
        Model model = service.retrievePublicationById(publicationId);

        if (model.isEmpty()) {
            throw new NotFoundException();
        }

        service.deletePublication(model);

        return Response.noContent().header("Access-Control-Allow-Origin", "*")
                                   .header("Access-Control-Allow-Methods", "GET")
                                   .allow("OPTIONS")
                                   .build();
    }

    @OPTIONS
    public Response corsPublicationBase(@HeaderParam("Access-Control-Request-Headers") String reqHeader) {
        return cors.makeCORSResponse(Response.ok(), reqHeader);
    }

    @OPTIONS
    @Path("/{publicationId: [a-zA-Z0-9_]+}")
    public Response corsPublicationId(@HeaderParam("Access-Control-Request-Headers") String reqHeader) {
        return cors.makeCORSResponse(Response.ok(), reqHeader);
    }


    @PATCH
    @Path("/{publicationId: [a-zA-Z0-9_]+}")
    @Consumes(MimeType.LDPATCHJSON)
    public Response patchPublication(@PathParam("publicationId") String publicationId, String requestBody) throws Exception {
        if ( !service.getRepository().askIfResourceExists(baseURI.getPublicationURI() + publicationId) ) {
            throw new NotFoundException();
        }
        Model m;
        try {
             m = service.patchPublication(publicationId, requestBody);
        } catch (Exception e) {
            throw new BadRequestException();
        }

        return Response.ok().entity(jsonld.getJson(m))
                       .header("Access-Control-Allow-Origin", "*")
                       .header("Access-Control-Allow-Methods", "PATCH")
                       .allow("OPTIONS")
                       .build();
    }

}
