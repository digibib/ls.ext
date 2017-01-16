package no.deichman.services.search;

import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

/**
 * Responsibility: Represent a thing with a name.
 */
public class NameEntry {
    public static final int INITIAL_ODD_NUMBER = 17;
    public static final int MULTIPLIER_ODD_NUMBER = 37;
    private String name;
    private String uri;
    private boolean bestMatch;


    public NameEntry(String uri, String name) {
        this.uri = uri;
        this.name = name;
    }

    public NameEntry(NameEntry nameEntry) {
        this(nameEntry.getUri(), nameEntry.getName());
    }

    public final String getName() {
        return name;
    }

    public final String getUri() {
        return uri;
    }

    @Override
    public final String toString() {
        return "NameEntry{"
                + "name='" + name + '\''
                + ", uri='" + uri + '\''
                + '}';
    }

    @Override
    public final boolean equals(Object o) {
        if (this == o) {
            return true;
        }

        if (!(o instanceof NameEntry)) {
            return false;
        }

        NameEntry nameEntry = (NameEntry) o;

        return new EqualsBuilder()
                .append(name, nameEntry.name)
                .append(uri, nameEntry.uri)
                .isEquals();
    }

    @Override
    public final int hashCode() {
        return new HashCodeBuilder(INITIAL_ODD_NUMBER, MULTIPLIER_ODD_NUMBER)
                .append(name)
                .append(uri)
                .toHashCode();
    }

    public final void setBestMatch(boolean bestMatch) {
        this.bestMatch = bestMatch;
    }

    public final boolean isBestMatch() {
        return bestMatch;
    }
}
