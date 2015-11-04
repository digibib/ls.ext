package no.deichman.services.entity.kohaadapter;

/**
 * Responsibility: Represents one entry in a MARC record.
 */
public class Group {
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
}
