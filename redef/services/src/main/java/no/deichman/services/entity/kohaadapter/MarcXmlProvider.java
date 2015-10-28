package no.deichman.services.entity.kohaadapter;

import org.marc4j.MarcWriter;
import org.marc4j.MarcXmlWriter;
import org.marc4j.marc.DataField;
import org.marc4j.marc.MarcFactory;
import org.marc4j.marc.Record;

import java.io.ByteArrayOutputStream;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

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

    public void add952(Map<Character, String> subfields) {
        final DataField field952 = marcFactory.newDataField(MarcConstants.FIELD_952, ' ', ' ');
        for (Map.Entry<Character,String> entry : subfields.entrySet()) {
            field952.addSubfield(marcFactory.newSubfield(entry.getKey(), entry.getValue()));
        }
        this.record.addVariableField(field952);
    }

    public void add245(Map<Character, String> subfields) {
        final DataField field245 = marcFactory.newDataField(MarcConstants.FIELD_245, ' ', ' ');
        for (Map.Entry<Character,String> entry : subfields.entrySet()) {
            field245.addSubfield(marcFactory.newSubfield(entry.getKey(), entry.getValue()));
        }
        this.record.addVariableField(field245);
    }

    //public void addSubfield(String field, )

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
