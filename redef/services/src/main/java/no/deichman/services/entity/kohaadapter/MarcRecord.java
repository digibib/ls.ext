package no.deichman.services.entity.kohaadapter;

import org.marc4j.MarcWriter;
import org.marc4j.MarcXmlWriter;
import org.marc4j.marc.MarcFactory;
import org.marc4j.marc.Record;

import java.io.ByteArrayOutputStream;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;

/**
 * Responsibility: In-memory MARC record.
 */
public class MarcRecord {
    private Record record;
    private final MarcFactory marcFactory = MarcFactory.newInstance();

    public MarcRecord() {
        record = marcFactory.newRecord(marcFactory.newLeader(MarcConstants.TWENTY_FOUR_SPACES));
    }

    public final void addMarcField(MarcField marcField) {
        this.record.addVariableField(marcField.getDataField());
    }

    public static MarcField newDataField(String field) {
        return new MarcField(field);
    }

    public final boolean hasItems() {
        return !record.find(MarcConstants.FIELD_952, "").isEmpty();
    }

    public final String getMarcXml() {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        MarcWriter writer = new MarcXmlWriter(baos);
        writer.write(getRecord());
        writer.close();
        try {
            return baos.toString(StandardCharsets.UTF_8.name());
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException(e);
        }
    }

    final Record getRecord() {
        return this.record;
    }
}
