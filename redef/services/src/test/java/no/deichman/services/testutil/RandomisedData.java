package no.deichman.services.testutil;

import no.deichman.services.circulation.Item;
import no.deichman.services.entity.EntityType;
import no.deichman.services.rdf.MediaType;
import no.deichman.services.rdf.Nationality;
import no.deichman.services.rdf.Role;
import no.deichman.services.uridefaults.BaseURI;
import no.deichman.services.uridefaults.XURI;
import org.apache.commons.lang3.RandomStringUtils;

import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Responsibility: provide random dates.
 */
public final class RandomisedData {

    public static final int ORIGIN = 1;
    public static final int BOUND = 10000;

    private static DateTime getRandomizedDateTime(String origin, String bound) {
        long beginTime = Timestamp.valueOf(origin).getTime();
        long endTime = Timestamp.valueOf(bound).getTime();
        long diff = endTime - beginTime + 1;
        long time = beginTime + (long) (Math.random() * diff);
        return new DateTime(time);
    }

    private static DateTime getStandardRandomizedDateTime() {
        return getRandomizedDateTime("2010-01-01 00:00:00", "2017-03-01 00:00:00");
    }

    public static String randomYear() {
        return Integer.toString(getStandardRandomizedDateTime().getYear());
    }

    public String getTimestamp() {
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss");
        return dateFormat.format(getStandardRandomizedDateTime().getMillis());
    }


    private static int generateRandomInteger(int origin, int bound) {
        return ThreadLocalRandom.current().nextInt(origin, bound);
    }

    public static String randomNumericID() {
        return String.valueOf(generateRandomInteger(ORIGIN, BOUND));
    }


    public static String randomURI(EntityType entityType) throws Exception {
        char entityIdChar = 'o';

        switch (entityType.getPath().toLowerCase()) {
            case "work":
                entityIdChar = 'w';
                break;
            case "publication":
                entityIdChar = 'p';
                break;
            case "person":
                entityIdChar = 'h';
                break;
            default:
                break;
        }

        return new XURI(BaseURI.root(), entityType.getPath(), entityIdChar + randomNumericID()).getUri();
    }

    public static String randomInvertedName() {
        return RandomStringUtils.random(10) + ", " + RandomStringUtils.random(6);
    }

    public static String randomNationality() {
        String[] nationality = {
                Nationality.ABORIG.getURI(),
                Nationality.BANGL.getURI(),
                Nationality.CHIL.getURI(),
                Nationality.D.getURI(),
                Nationality.ECUAD.getURI(),
                Nationality.FR.getURI(),
                Nationality.GAS.getURI(),
                Nationality.HAIT.getURI(),
                Nationality.INUIT.getURI(),
                Nationality.JAM.getURI(),
                Nationality.KAPPVERD.getURI(),
                Nationality.LAOT.getURI(),
                Nationality.MONEG.getURI(),
                Nationality.NAMIB.getURI(),
                Nationality.OM.getURI(),
                Nationality.PAL.getURI(),
                Nationality.QAT.getURI(),
                Nationality.RWAND.getURI(),
                Nationality.SALVAD.getURI(),
                Nationality.TADSJ.getURI(),
                Nationality.UKR.getURI(),
                Nationality.VIET.getURI(),
                Nationality.WAL.getURI(),
                Nationality.YEMEN.getURI(),
                Nationality.ZIMB.getURI()
        };

        return nationality[generateRandomInteger(0, 25)];
    }

    public static String randomRole() {
        String[] role = {
                Role.ACTOR.getURI(),
                Role.ADAPTOR.getURI(),
                Role.AUTHOR.getURI(),
                Role.COMPOSER.getURI(),
                Role.CONDUCTOR.getURI(),
                Role.CONTRIBUTOR.getURI(),
                Role.COREOGRAPHER.getURI(),
                Role.DIRECTOR.getURI(),
                Role.EDITOR.getURI(),
                Role.FEATURING.getURI(),
                Role.ILLUSTRATOR.getURI(),
                Role.LYRICIST.getURI(),
                Role.MUSICALARRANGER.getURI(),
                Role.PERFORMER.getURI(),
                Role.PHOTOGRAPHER.getURI(),
                Role.PRODUCTIONCOMPANY.getURI(),
                Role.PRODUCER.getURI(),
                Role.PUBLISHER.getURI(),
                Role.READER.getURI(),
                Role.SCRIPTWRITER.getURI(),
                Role.TRANSLATOR.getURI()
        };
        return role[generateRandomInteger(0, 20)];

    }

    public static String randomTitle() {
        return RandomStringUtils.random(generateRandomInteger(0, 3)) + " "
               + RandomStringUtils.random(generateRandomInteger(3, 11)) + " "
                + RandomStringUtils.random(generateRandomInteger(3, 6));
    }

    public static String randomURL() {
        return "http://example.org/" + generateRandomInteger(6,10);
    }

    public static String randomMediaType() {
        String[] mediaType = {
                MediaType.AUDIOBOOK.getURI(),
                MediaType.BOOK.getURI(),
                MediaType.COMICBOOK.getURI(),
                MediaType.E_BOOK.getURI(),
                MediaType.FILM.getURI(),
                MediaType.GAME.getURI(),
                MediaType.LANGUAGECOURSE.getURI(),
                MediaType.MUSICRECORDING.getURI(),
                MediaType.OTHER.getURI(),
                MediaType.PERIODICAL.getURI(),
                MediaType.SHEETMUSIC.getURI()
        };
        return mediaType[generateRandomInteger(0, 9)];
    }

    public static String randomString(int length) {
        return RandomStringUtils.random(length);
    }

    public static Item randomItem(String itemNumber, String recordNumber, DateTime dueDate, String itemType, boolean reservable) {
        DateTimeFormatter dateTimeFormatter = DateTimeFormat.forPattern("yyyy-MM-dd");
        Item item = new Item();
        item.setId(itemNumber);
        item.setRecordId(recordNumber);
        item.setType(itemType);
        item.setReservable(reservable);
        String returnDate = (dueDate == null) ? "" : dateTimeFormatter.print(dueDate);
        item.setReturnDate(returnDate);
        return item;
    }

    public static Item randomBorrowedItem(String itemNumber, String recordNumber, int dueInDays) {
        DateTime dateTime = new DateTime().plusDays(dueInDays);
        return randomItem(itemNumber, recordNumber, dateTime, "BOK", true);
    }

    public static Item randomAvailableItem(String itemNumber, String recordNumber) {
        return randomItem(itemNumber, recordNumber, null, "BOK", true);
    }
}
