package no.deichman.services.entity.kohaadapter;

import no.deichman.services.circulation.Record;
import no.deichman.services.testUtils.RandomDate;
import org.apache.commons.lang3.RandomStringUtils;

/**
 * Responsibility: provide a random record.
 */
public final class RandomRecord {

    private RandomRecord() {}

    public static Record populateRandom(String id, boolean zeroUser, int numberOfHolds) {
        Record record = new Record();
        RandomDate randomDate = new RandomDate();

        record.setId(id);
        record.setAbstract(RandomStringUtils.random(10));
        record.setAuthor(RandomStringUtils.random(10) + ", " + RandomStringUtils.random(6));
        record.setBehindExpiditedUser((zeroUser) ? 1 : 0);
        record.setCopyrightDate(randomDate.getYear());
        record.setDateCreated(randomDate.getTimestamp());
        record.setFrameworkCode(RandomStringUtils.random(4).toUpperCase());
        record.setNotes(RandomStringUtils.random(20));
        record.setNumberOfHolds(numberOfHolds);
        record.setSerial(null);
        record.setSeriesTitle(null);
        record.setTimestamp(randomDate.getTimestamp());
        record.setTitle(RandomStringUtils.random(24));
        record.setUniformTitle(RandomStringUtils.random(24));

        return record;
    }
}
