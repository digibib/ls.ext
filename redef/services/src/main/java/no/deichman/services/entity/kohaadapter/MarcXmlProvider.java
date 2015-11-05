package no.deichman.services.entity.kohaadapter;

import org.marc4j.MarcWriter;
import org.marc4j.MarcXmlWriter;
import org.marc4j.marc.DataField;
import org.marc4j.marc.MarcFactory;
import org.marc4j.marc.Record;

import javax.ws.rs.core.MultivaluedMap;
import java.io.ByteArrayOutputStream;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;

/**
 * Responsibility: Make a MARCXML record.
 */
final class MarcXmlProvider {

    private Record record;
    private final MarcFactory marcFactory = MarcFactory.newInstance();

    public MarcXmlProvider() {
    }

    public void createRecord() {
        this.record = marcFactory.newRecord(marcFactory.newLeader(MarcConstants.TWENTY_FOUR_SPACES));
    }

    public void addSubfield(String field, MultivaluedMap<Character, String> subfields) {
        final DataField dataField = marcFactory.newDataField(field, ' ', ' ');
        subfields.forEach((subfield, values) -> values.forEach(value -> dataField.addSubfield(marcFactory.newSubfield(subfield, value))));
        this.record.addVariableField(dataField);
    }

    public String getMarcXml() {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        MarcWriter writer = new MarcXmlWriter(baos);
        writer.write(this.getRecord());
        writer.close();
        try {
            return baos.toString(StandardCharsets.UTF_8.name());
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException(e);
        }
    }

    Record getRecord() {
        return this.record;
    }
}
