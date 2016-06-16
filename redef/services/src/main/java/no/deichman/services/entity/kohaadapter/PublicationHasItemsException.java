package no.deichman.services.entity.kohaadapter;

import javax.ws.rs.BadRequestException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 * Responsibility: exception for when a publication cannot be deleted because it has items.
 */
public class PublicationHasItemsException extends BadRequestException {
    public PublicationHasItemsException(int numberOfItems) {
        super(Response.status(Response.Status.BAD_REQUEST)
                .entity(String.format("{\"numberOfItemsLeft\": %d}", numberOfItems)).type(MediaType.APPLICATION_JSON).build());
    }
}
