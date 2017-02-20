package no.deichman.services.uridefaults;

import no.deichman.services.entity.EntityType;
import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.ResourceFactory;

import java.net.URI;
import java.net.URISyntaxException;

/**
 * Responsibility: Provide a way of working with URIs.
 */
@SuppressWarnings("MagicNumber")
public class XURI implements Comparable {
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

    public final Resource getAsResource() {
        return ResourceFactory.createResource(uri);
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
            String[] aPath = aUri.getPath().split("/");

            if (aPath.length > 2 && testEntity(aPath[1]) && testId(aPath[2])) {
                this.uri = uri;
                this.type = aPath[1];
                this.id = aPath[2];
                ret = true;
            } else {
                throw new Exception("URI not structured according to http://{host}/{entity}/{id} pattern: " + uri);
            }
        } catch (URISyntaxException e) {
            e.printStackTrace();
        }
        return ret;
    }


    private boolean testId(String id) {
        String pattern = "(w|p|h|g|c|s|e|m|i|t|v)[a-zA-Z0-9_]+";
        return id.matches(pattern);
    }

    private boolean testEntity(String entity) {
        return entity.matches(EntityType.ALL_TYPES_PATTERN);
    }

    @Override
    public final String toString() {
        return uri;
    }

    @Override
    public final boolean equals(Object o) {
        if (this == o) {
            return true;
        }

        if (!(o instanceof XURI)) {
            return false;
        }

        XURI xuri = (XURI) o;

        return new EqualsBuilder()
                .append(uri, xuri.uri)
                .append(type, xuri.type)
                .append(id, xuri.id)
                .isEquals();
    }

    @Override
    public final int hashCode() {
        return new HashCodeBuilder(17, 37)
                .append(uri)
                .append(type)
                .append(id)
                .toHashCode();
    }

    @Override
    public final int compareTo(Object o) {
        return toString().compareTo(o.toString());
    }
}
