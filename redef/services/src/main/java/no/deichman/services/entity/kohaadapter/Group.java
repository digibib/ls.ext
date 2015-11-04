package no.deichman.services.entity.kohaadapter;

/**
 * Responsibility: Represents one entry in a MARC record.
 */
public class Group {
    public static final int THIRTY_ONE = 31;
    private String field;
    private char subfield;
    private String value;

    public Group(String field, char subfield, String value) {
        this.field = field;
        this.subfield = subfield;
        this.value = value;
    }

    public final String getField() {
        return field;
    }

    public final void setField(String field) {
        this.field = field;
    }

    public final char getSubfield() {
        return subfield;
    }

    public final void setSubfield(char subfield) {
        this.subfield = subfield;
    }

    public final String getValue() {
        return value;
    }

    public final void setValue(String value) {
        this.value = value;
    }

    @Override
    public final boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        Group group = (Group) o;

        if (subfield != group.subfield) {
            return false;
        }
        if (!field.equals(group.field)) {
            return false;
        }
        return value.equals(group.value);
    }

    @Override
    public final int hashCode() {
        int result = field.hashCode();
        result = THIRTY_ONE * result + (int) subfield;
        result = THIRTY_ONE * result + value.hashCode();
        return result;
    }
}
