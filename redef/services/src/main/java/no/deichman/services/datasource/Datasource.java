package no.deichman.services.datasource;

import com.google.common.collect.ImmutableMap;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import no.deichman.services.entity.external.ExternalCatalogue;
import no.deichman.services.entity.external.Mapper;
import no.deichman.services.entity.external.SRUHttpClient;
import no.deichman.services.entity.external.SearchResultInfo;
import no.deichman.services.restutils.MimeType;

import javax.inject.Singleton;
import javax.ws.rs.BadRequestException;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Response;
import java.net.MalformedURLException;
import java.util.Map;

import static java.lang.System.getProperty;
import static no.deichman.services.restutils.MimeType.LD_JSON;

/**
 * Responsibility: Provide data from external resources.
 */

@Singleton
@Path("datasource")
public class Datasource {

    private static final Map<String, ExternalCatalogue> EXTERNAL_CATALOGUES;

    static {
        try {
            EXTERNAL_CATALOGUES = ImmutableMap
                    .of("dfb", new SRUHttpClient(getProperty("DFB_SRU_ENDPOINT", "https://dfbbib.bib.no/cgi-bin/sru?version=1.2")),
                            "loc", new SRUHttpClient(getProperty("LOC_SRU_ENDPOINT", "http://www.loc.gov/z39voy?version=1.1")),
                            "bibbi", new SRUHttpClient(
                                    getProperty(
                                            "BIBBI_SRU_ENDPOINT",
                                            "https://sru.mikromarc.no/mmwebapi/bibbi/6475/SRU?httpAccept=text/xml&version=2.0"
                                    )));
        } catch (MalformedURLException e) {
            throw new RuntimeException(e);
        }
    }

    public Datasource() {
    }

    @GET
    @Path("{datasource: (bibbi|loc|dfb)}")
    @Produces(LD_JSON + MimeType.UTF_8)
    public final Response getByField(
            @PathParam("datasource") String datasource,
            @QueryParam("isbn") String isbn,
            @QueryParam("ean") String ean,
            @QueryParam("local_id") String localId,
            @QueryParam("title") String title,
            @QueryParam("media_type") String mediaType,
            @QueryParam("author") String author) throws Exception {

        if (mediaType == null) {
            throw new BadRequestException("missing mandatory query parameter: media_type");
        }
        String idType = "isbn";
        String term = "";
        if (isbn != null) {
            idType = "isbn";
            term = isbn;
        } else if (ean != null) {
            idType = "ean";
            term = ean;
        } else if (localId != null) {
            idType = "local_id";
            term = localId;
        } else if (title != null) {
            idType = "title";
            term = title;
        } else if (author != null) {
            idType = "author";
            term = author;
        }

        Mapper mapper = new Mapper();

        Gson gson = new GsonBuilder().setPrettyPrinting().create();

        SearchResultInfo searchResultInfo = EXTERNAL_CATALOGUES.get(datasource).getByField(datasource, term, idType, mediaType);

        String result = "";

        if (searchResultInfo != null && !searchResultInfo.isEmpty()) {
            result = gson.toJson(mapper.map(mediaType, datasource, searchResultInfo));
        }

        return Response.ok().entity(result).build();
    }
}
