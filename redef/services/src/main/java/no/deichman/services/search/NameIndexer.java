package no.deichman.services.search;

import java.util.Collection;
import java.util.List;

/**
 * Responsibility: Interface for local indexing.
 */
public interface NameIndexer {
    List<NameEntry> neighbourhoodOf(String name, int width);

    void addNamedItem(String name, String uri);

    void removeNamedItem(String name, String uri);

    Collection<NameEntry> getRegister(int startIndex, int length);

    boolean isEmpty();

    int size();

    void removeUri(String uri);
}
