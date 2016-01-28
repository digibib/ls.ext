package no.deichman.services.version;

import com.google.gson.JsonObject;

import javax.inject.Singleton;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;
import java.io.IOException;
import java.util.Optional;

import static no.deichman.services.restutils.MimeType.JSON;

/**
 * Responsibility: Return GITREF and Jenkins ID (if available).
 */
@Singleton
@Path("version")
public final class VersionResource {
    private final String versionJson;

    public VersionResource() {
        JsonObject json = new JsonObject();
        json.addProperty("gitref", Optional.ofNullable(System.getenv("GITREF")).orElse(""));
        json.addProperty("jenkinsId", Optional.ofNullable(System.getenv("JENKINSID")).orElse(""));
        versionJson = json.toString();
    }

    @GET
    @Produces(JSON)
    public Response getVersion() throws IOException {
        return Response.ok().entity(versionJson).build();
    }
}
