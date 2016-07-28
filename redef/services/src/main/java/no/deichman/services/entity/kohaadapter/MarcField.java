package no.deichman.services.entity.kohaadapter;

import info.freelibrary.marc4j.impl.SubfieldImpl;
import org.marc4j.marc.DataField;
import org.marc4j.marc.MarcFactory;

/**
 * Responsibility: Abstraction for DataField.
 */
public class MarcField {
    private DataField dataField;

    MarcField(String field) {
        MarcFactory marcFactory = MarcFactory.newInstance();
        dataField = marcFactory.newDataField(field, ' ', ' ');
    }

    public final void addSubfield(char subfield, String value) {
        dataField.addSubfield(new SubfieldImpl(subfield, value));
    }

    public final int size() {
        return dataField.countSubfields();
    }

    final DataField getDataField() {
        return dataField;
    }
}
