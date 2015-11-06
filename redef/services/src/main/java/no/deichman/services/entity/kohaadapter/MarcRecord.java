package no.deichman.services.entity.kohaadapter;

import org.apache.commons.collections4.CollectionUtils;
import org.marc4j.MarcWriter;
import org.marc4j.MarcXmlWriter;
import org.marc4j.marc.MarcFactory;
import org.marc4j.marc.Record;

import java.io.ByteArrayOutputStream;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Responsibility: In-memory MARC record.
 */
public class MarcRecord {
    public static final int THIRTY_ONE = 31;
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

    @Override
    public final boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        MarcRecord that = (MarcRecord) o;

        List<String> comparisonList1 = new ArrayList<>();
        comparisonList1.add(record.getLeader().toString());
        comparisonList1.addAll(record.getControlFields().stream().map(controlField -> controlField.toString()).collect(Collectors.toList()));
        comparisonList1.addAll(record.getDataFields().stream().map(dataField -> sortAndJoinMarcDataField(dataField.toString())).collect(Collectors.toList()));

        List<String> comparisonList2 = new ArrayList<>();
        comparisonList2.add(that.getRecord().getLeader().toString());
        comparisonList2.addAll(that.getRecord().getControlFields().stream().map(controlField -> controlField.toString()).collect(Collectors.toList()));
        comparisonList2.addAll(that.getRecord().getDataFields().stream().map(dataField -> sortAndJoinMarcDataField(dataField.toString())).collect(Collectors.toList()));

        return CollectionUtils.isEqualCollection(comparisonList1, comparisonList2);
    }

    private String sortAndJoinMarcDataField(String input) {
        String fieldCode = input.substring(0, input.indexOf("$"));

        String[] split = input.substring(fieldCode.length()).split("\\$");
        Arrays.sort(split);
        return fieldCode + String.join("$", split);
    }

    @Override
    public final int hashCode() {
        int result = record != null ? record.hashCode() : 0;
        result = THIRTY_ONE * result + (marcFactory != null ? marcFactory.hashCode() : 0);
        return result;
    }
}
