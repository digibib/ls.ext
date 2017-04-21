package no.deichman.services.testUtils;

import org.joda.time.DateTime;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;

/**
 * Responsibility: provide random dates.
 */
public final class RandomDate {

    private DateTime getRandomizedDateTime(String origin, String bound) {
        long beginTime = Timestamp.valueOf(origin).getTime();
        long endTime = Timestamp.valueOf(bound).getTime();
        long diff = endTime - beginTime + 1;
        long time = beginTime + (long) (Math.random() * diff);
        return new DateTime(time);
    }

    private DateTime getStandardRandomizedDateTime() {
        return getRandomizedDateTime("2010-01-01 00:00:00", "2017-03-01 00:00:00");
    }

    public String getYear() {
        return Integer.toString(getStandardRandomizedDateTime().getYear());
    }

    public String getTimestamp() {
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss");
        return dateFormat.format(getStandardRandomizedDateTime().getMillis());
    }
}
