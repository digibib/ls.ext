package no.deichman.services.search;

import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;

import java.io.Reader;
import java.text.Collator;
import java.text.ParseException;
import java.text.RuleBasedCollator;
import java.util.Collection;
import java.util.LinkedList;
import java.util.List;
import java.util.ListIterator;
import java.util.Map;
import java.util.Set;

import static com.google.common.collect.Lists.newArrayList;
import static com.google.common.collect.Lists.newLinkedList;
import static com.google.common.collect.Maps.newHashMap;
import static com.google.common.collect.Sets.newHashSet;
import static java.util.Collections.emptySet;

/**
 * Responsibility: holds an alphabetical list of things with names.
 */
public class InMemoryNameIndexer implements NameIndexer {
    private LinkedList<NameEntry> alphabeticalList;
    private Map<String, Set<String>> uriToNameList;
    private Collator coll;
    private static final String SORTING_RULES = ""
            + " < ' (' < ',' < ' ' < '-' < '.'"
            + "< '(' < ')'"
            + "< 0 < 1 < 2 < 3 < 4 < 5 < 6 < 7 < 8 < 9"
            + "< a, á, à, ã, ä, A, Á, À, Ã, Ä < b, B < c, C < ð, Ð < d, D < e, é, è, ê, ë, E, É, È, Ê, Ë < f, F "
            + "< g, G < h, H < i, í, ï, I, Í, Ï"
            + "< j, J < k, K < l, L < m, M < n, ñ, N, Ñ < o, ó, ò, ô, O, Ó, Ò, Ô < p, P < q, Q < r, R"
            + "< s, S < t, T < u, U, ü, Ü < v, V < w, W < x, X < y, Y < z, Z"
            + "< æ, ä, Æ, Ä"
            + "< ø, ö, Ø, Ö"
            + "< å = a\u030A = aa, "
            + "  Å = A\u030A = Aa";

    InMemoryNameIndexer() {
        try {
            coll = new RuleBasedCollator(SORTING_RULES);
        } catch (ParseException e) {
            throw new RuntimeException(e);
        }
        coll.setStrength(Collator.PRIMARY);
        alphabeticalList = newLinkedList();
        uriToNameList = newHashMap();
    }

    InMemoryNameIndexer(Reader reader) {
        this();
        GsonBuilder gsonBuilder = new GsonBuilder();
        JsonElement jsonElement = gsonBuilder.create().fromJson(reader, JsonElement.class);
        jsonElement.getAsJsonObject().get("results").getAsJsonObject().getAsJsonArray("bindings").forEach(e -> {
            String uri = e.getAsJsonObject().getAsJsonObject("uri").get("value").getAsString();
            String name = e.getAsJsonObject().getAsJsonObject("name").get("value").getAsString();
            alphabeticalList.add(new NameEntry(uri, name));
            rememberUriToName(uri, name);
        });
        sort();
    }

    InMemoryNameIndexer(Map<String, String> labelToURI) {
        this();
        for (Map.Entry<String, String> entry : labelToURI.entrySet()) {
            alphabeticalList.add(new NameEntry(entry.getKey(), entry.getValue()));
            rememberUriToName(entry.getKey(), entry.getValue());
        }
        sort();
    }

    private void sort() {
        alphabeticalList.sort((o1, o2) -> coll.compare(o1.getName(), o2.getName()));
    }

    public final List<NameEntry> neighbourhoodOf(String name, int width) {
        List<NameEntry> retVal = newArrayList();
        boolean foundBestMatch = false;
        ListIterator<NameEntry> resultIterator = findNamed(name);
        for (int i = 0; i < width / 2 && resultIterator.hasPrevious(); i++) {
            resultIterator.previous();
        }
        for (int i = 0; i < width && resultIterator.hasNext(); i++) {
            NameEntry next = new NameEntry(resultIterator.next());
            if (!foundBestMatch && coll.compare(next.getName(), name) >= 0) {
                foundBestMatch = true;
                next.setBestMatch(true);
                if (next.getName().equalsIgnoreCase(name)) {
                    next.setExactMatch(true);
                }
            }
            retVal.add(next);
        }
        return retVal;
    }

    @SuppressWarnings("checkstyle:InnerAssignment")
    private ListIterator<NameEntry> findNamed(String name) {
        ListIterator<NameEntry> resultIterator = alphabeticalList.listIterator(alphabeticalList.size() / 2);
        boolean foundPosition = false;
        int compared = 0;
        NameEntry candidate = null;
        int step = 0;
        while (!foundPosition && resultIterator.hasNext()) {
            if (candidate == null) {
                candidate = resultIterator.next();
                compared = coll.compare(name, candidate.getName());
                if (compared == 0) {
                    resultIterator.previous();
                }
            } else {
                compared = coll.compare(name, candidate.getName());
            }
            int skips = (alphabeticalList.size() + 1) / (2 << ++step);
            if (compared > 0) {
                if (skips > 0) {
                    while (skips > 0 && resultIterator.hasNext()) {
                        candidate = resultIterator.next();
                        skips--;
                    }
                } else {
                    foundPosition = true;
                }
            } else if (compared < 0) {
                if (skips > 0) {
                    while (skips >= 0 && resultIterator.hasPrevious()) {
                        candidate = resultIterator.previous();
                        skips--;
                    }
                } else {
                    foundPosition = true;
                }
            } else {
                foundPosition = true;
            }
        }

        boolean peeked = resultIterator.hasNext();
        while (peeked && resultIterator.hasNext() && (compared = coll.compare(name, resultIterator.next().getName())) > 0) {
            peeked = true;
        }
        if (peeked && resultIterator.hasPrevious() && compared < 0) {
            resultIterator.previous();
            peeked = false;
        }
        peeked = resultIterator.hasPrevious();
        while (peeked && resultIterator.hasPrevious() && (compared = coll.compare(name, resultIterator.previous().getName())) <= 0) {
            peeked = true;
        }
        if (peeked && resultIterator.hasNext() && compared > 0) {
            resultIterator.next();
        }
        return resultIterator;
    }

    @Override
    public final synchronized void addNamedItem(String name, String uri) {
        NameEntry nameEntry = new NameEntry(uri, name);
        ListIterator<NameEntry> found = findNamed(name);
        if (found.hasNext()) {
            NameEntry peek = found.next();
            if (!peek.equals(nameEntry)) {
                found.previous();
                found.add(nameEntry);
            }
        } else {
            found.add(nameEntry);
        }
        rememberUriToName(uri, name);
    }

    @Override
    public final synchronized void removeNamedItem(String name, String uri) {
        NameEntry nameEntry = new NameEntry(uri, name);
        ListIterator<NameEntry> found = findNamed(name);
        while (found.hasNext() && found.next().equals(nameEntry)) {
            found.remove();
            uriToNameList.get(uri).remove(name);
        }
    }

    @Override
    public final synchronized Collection<NameEntry> getRegister(int startIndex, int length) {
        List<NameEntry> retVal = newArrayList();
        ListIterator<NameEntry> resultIterator = alphabeticalList.listIterator(startIndex);
        for (int i = 0; i < length && resultIterator.hasNext(); i++) {
            retVal.add(resultIterator.next());
        }
        return retVal;
    }

    @Override
    public final boolean isEmpty() {
        return alphabeticalList.isEmpty();
    }

    @Override
    public final int size() {
        return alphabeticalList.size();
    }

    @Override
    public final void removeUri(String uri) {
        uriToNameList.getOrDefault(uri, emptySet()).forEach(name -> removeNamedItem(name, uri));
    }

    private void rememberUriToName(String uri, String name) {
        Set<String> namesForUri = uriToNameList.get(uri);
        if (namesForUri == null) {
            namesForUri = newHashSet(name);
            uriToNameList.put(uri, namesForUri);
        } else {
            namesForUri.add(name);
        }
    }
}
