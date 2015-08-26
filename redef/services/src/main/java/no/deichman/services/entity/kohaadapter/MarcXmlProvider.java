package no.deichman.services.entity.kohaadapter;

import java.io.ByteArrayOutputStream;

import org.marc4j.MarcWriter;
import org.marc4j.MarcXmlWriter;
import org.marc4j.marc.Leader;
import org.marc4j.marc.Record;

import info.freelibrary.marc4j.impl.LeaderImpl;
import info.freelibrary.marc4j.impl.RecordImpl;

/**
 * Responsibility: Make a MARCXML record.
 */
public final class MarcXmlProvider {

    private static final String TWENTY_FOUR_SPACES = "                        ";
    private Record record;

    public MarcXmlProvider() {}

    private Leader createLeader() {
        Leader leader = new LeaderImpl();
        leader.unmarshal(TWENTY_FOUR_SPACES);
        return leader;
    }

    public void createRecord() {
        this.record = new RecordImpl();
        this.record.setLeader(createLeader());
    }

    public String getMarcXml() {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        MarcWriter writer = new MarcXmlWriter(baos);
        writer.write(this.getRecord());
        writer.close();
        return baos.toString();
    }

    public Record getRecord() {
        return this.record;
    }
}
