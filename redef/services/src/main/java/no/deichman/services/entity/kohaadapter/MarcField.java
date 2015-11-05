package no.deichman.services.entity.kohaadapter;

import info.freelibrary.marc4j.impl.SubfieldImpl;
import org.marc4j.marc.DataField;
import org.marc4j.marc.MarcFactory;

/**
 * Responsibility: Abstraction for DataField.
 */
public class MarcField {
    private DataField dataField;
    private final MarcFactory marcFactory = MarcFactory.newInstance();

    public MarcField(String field) {
        dataField = marcFactory.newDataField(field, ' ', ' ');
    }

    public final void addSubfield(char subfield, String value) {
        dataField.addSubfield(new SubfieldImpl(subfield, value));
    }

    public final DataField getDataField() {
        return dataField;
    }
}
