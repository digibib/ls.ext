package no.deichman.services.search;

import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import org.apache.jena.query.ResultSet;
import org.apache.jena.sparql.core.Var;
import org.apache.jena.sparql.engine.binding.Binding;

import java.io.Reader;
import java.text.Collator;
import java.util.Collection;
import java.util.LinkedList;
import java.util.List;
import java.util.ListIterator;
import java.util.Locale;

import static com.google.common.collect.Lists.newArrayList;

/**
 * Responsibility: holds an alphabetical list of things with names.
 */
public class NameIndexer {
    private LinkedList<NameEntry> alphabeticalList;
    private Collator coll;

    public NameIndexer() {
        coll = Collator.getInstance(Locale.forLanguageTag("no_NO"));
        coll.setStrength(Collator.PRIMARY);
        alphabeticalList = new LinkedList();
    }

    public NameIndexer(Reader reader) {
        this();
        GsonBuilder gsonBuilder = new GsonBuilder();
        JsonElement jsonElement = gsonBuilder.create().fromJson(reader, JsonElement.class);
        jsonElement.getAsJsonObject().get("results").getAsJsonObject().getAsJsonArray("bindings").forEach(e -> {
            String uri = e.getAsJsonObject().getAsJsonObject("uri").get("value").getAsString();
            String name = e.getAsJsonObject().getAsJsonObject("name").get("value").getAsString();
            alphabeticalList.add(new NameEntry(uri, name));
        });
        sort();
    }

    public NameIndexer(ResultSet resultSet) {
        this();
        while(resultSet.hasNext()) {
            Binding binding = resultSet.nextBinding();
            String uri = binding.get(Var.alloc("uri")).getURI().toString();
            String name = binding.get(Var.alloc("name")).getLiteral().toString();
            alphabeticalList.add(new NameEntry(uri, name));
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
            NameEntry next = resultIterator.next();
            if (!foundBestMatch && coll.compare(next.getName(), name) > 0) {
                foundBestMatch = true;
                next.setBestMatch(true);
            }
            retVal.add(next);
        }
        return retVal;
    }

    private ListIterator<NameEntry> findNamed(String name) {
        ListIterator<NameEntry> resultIterator = alphabeticalList.listIterator(alphabeticalList.size() / 2);
        boolean foundPosition = false;
        int step = 0;
        while (!foundPosition && resultIterator.hasNext()) {
            step++;
            NameEntry candidate = resultIterator.next();
            int compared = coll.compare(name, candidate.getName());
            int skips = alphabeticalList.size() / (2 << step);
            if (compared > 0) {
                if (skips > 0) {
                    while (skips > 0 && resultIterator.hasNext()) {
                        resultIterator.next();
                        skips--;
                    }
                } else {
                    foundPosition = true;
                }
            } else if (compared < 0) {
                if (skips > 0) {
                    while (skips >= 0 && resultIterator.hasPrevious()) {
                        resultIterator.previous();
                        skips--;
                    }
                } else {
                    foundPosition = true;
                }
            } else {
                foundPosition = true;
                if (resultIterator.hasPrevious()) {
                    resultIterator.previous();
                }
            }
        }
        return resultIterator;
    }

    public final void addNamedItem(String name, String uri) {
        NameEntry nameEntry = new NameEntry(uri, name);
        ListIterator<NameEntry> found = findNamed(name);
        if (!found.hasNext() || !found.next().equals(nameEntry)){
            found.add(nameEntry);
        }
        sort();
    }

    public final void removeNamedItem(String name, String uri) {
        NameEntry nameEntry = new NameEntry(uri, name);
        ListIterator<NameEntry> found = findNamed(name);
        while (found.hasNext() && found.next().equals(nameEntry)) {
            found.remove();
        }
    }

    public final Collection<NameEntry> getRegister(int startIndex, int length) {
        List<NameEntry> retVal = newArrayList();
        ListIterator<NameEntry> resultIterator = alphabeticalList.listIterator(startIndex);
        for (int i = 0; i < length && resultIterator.hasNext(); i++) {
            retVal.add(resultIterator.next());
        }
        return retVal;
    }

    public final boolean isEmpty() {
        return alphabeticalList.isEmpty();
    }
}
