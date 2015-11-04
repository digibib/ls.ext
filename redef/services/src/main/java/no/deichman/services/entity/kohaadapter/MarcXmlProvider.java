package no.deichman.services.entity.kohaadapter;

import org.marc4j.MarcWriter;
import org.marc4j.MarcXmlWriter;
import org.marc4j.marc.DataField;
import org.marc4j.marc.MarcFactory;
import org.marc4j.marc.Record;

import java.io.ByteArrayOutputStream;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.util.List;

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

    public void addSubfield(String field, List<Group> groups) {
        if(!groups.isEmpty()) {
            final DataField dataField = marcFactory.newDataField(field, ' ', ' ');
            groups.forEach(group -> dataField.addSubfield(marcFactory.newSubfield(group.getSubfield(), group.getValue())));
            this.record.addVariableField(dataField);
        }
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
