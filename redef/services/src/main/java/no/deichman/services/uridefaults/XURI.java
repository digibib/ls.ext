package no.deichman.services.uridefaults;

import no.deichman.services.entity.EntityType;

import java.net.URI;
import java.net.URISyntaxException;

/**
 * Responsibility: Provide a way of working with URIs.
 */
public class XURI {

    private String uri;
    private String type;
    private String id;

    public final String getUri() {
        return uri;
    }

    public final String getType() {
        return type;
    }
    public final EntityType getTypeAsEntityType() {
        return EntityType.get(type);
    }

    public final String getId() {
        return id;
    }

    public XURI(String inputBaseURI, String type, String id) throws Exception {
        parse(inputBaseURI + type + "/" + id);
    }

    public XURI(String uri) throws Exception {
        parse(uri);
    }

    private boolean parse(String uri) throws Exception {
        boolean ret = false;

        try {
            URI aUri = new URI(uri);
            String scheme = aUri.getScheme();
            String host = aUri.getHost();
            String[] aPath = aUri.getPath().split("/");

            if (testEntity(aPath[1]) && testId(aPath[2])) {
                this.uri = uri;
                this.type = aPath[1];
                this.id = aPath[2];
                ret = true;
            } else {
                throw new Exception("URI passed was not structured according to http://{host}/{entity}/{id} pattern");
            }
        } catch (URISyntaxException e) {
            e.printStackTrace();
        }
        return ret;
    }


    private boolean testId(String id) {
        String pattern = "(w|p|h|g|i|s)[a-zA-Z0-9_]+";
        return id.matches(pattern);
    }

    private boolean testEntity(String entity) {
        return entity.matches(EntityType.ALL_TYPES_PATTERN);
    }
}
