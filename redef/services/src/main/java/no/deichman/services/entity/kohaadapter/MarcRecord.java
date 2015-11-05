package no.deichman.services.entity.kohaadapter;

import javax.ws.rs.core.MultivaluedHashMap;
import javax.ws.rs.core.MultivaluedMap;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Responsibility: In-memory MARC record.
 */
public class MarcRecord {
    private List<Group> fields = new ArrayList<>();

    public final void addTitle(String title) {
        addGroup(MarcConstants.FIELD_245, MarcConstants.SUBFIELD_A, title);
    }

    public final void addGroup(String field, char subfield, String value) {
        fields.add(new Group(field, subfield, value));
    }

    public final MultivaluedMap<Character, String> fieldAsMap(String field) {
        MultivaluedMap<Character, String> subfields = new MultivaluedHashMap<>();
        fields.stream()
                .filter(s -> s.getField().equals(field))
                .forEach(s -> subfields.add(s.getSubfield(), s.getValue()));
        return subfields;
    }

    public final boolean isEmpty() {
        return fields.isEmpty();
    }

    public final List<Group> getField(String field) {
        return fields.stream()
                .filter(s -> s.getField().equals(field))
                .collect(Collectors.toList());
    }

    public final List<Group> getFields() {
        return fields;
    }

    @Override
    public final boolean equals(Object o) {
        if (this == o) {
            return true;
        } else if (o instanceof MarcRecord && ((MarcRecord) o).getFields().size() == fields.size()) {
            fields.removeAll(((MarcRecord) o).getFields());
            return fields.isEmpty();
        } else {
            return false;
        }
    }

    @Override
    public final int hashCode() {
        return fields.hashCode();
    }
}
