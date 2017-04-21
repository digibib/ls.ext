package no.deichman.services.entity;

import no.deichman.services.circulation.Item;
import org.joda.time.DateTime;
import org.joda.time.Days;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Responsibility: provides an estimate for expected availability dates.
 */
public final class Expectation {

    public static final int ONE_WEEK_IN_DAYS = 7;
    public static final int ONE_PLACE_ADJUSTMENT = 1;
    public static final int HANDLING_TIME = 1;
    public static final int TWO_WEEKS = 2;
    public static final int FOUR_WEEKS = 4;
    public static final int CUTTOFF = 12;

    public Estimation estimate(int queuePlace, List<Item> items, boolean precedingZeroUser) {
        Estimation estimation = new Estimation();
        List<Item> reservableItems = reservableOf(items);
        int availableItems = availableOf(reservableItems).size();

        if (reservableItems.size() == 0) {
            estimation.setError("No reservable items");
            return estimation;
        }

        if (queuePlace == 0) {
            estimation.setPending(true);
            return estimation;
        }

        int adjustedQueuePlace = precedingZeroUser ? queuePlace : queuePlace - ONE_PLACE_ADJUSTMENT;

        if (adjustedQueuePlace < availableItems) {
            estimation.setPending(true);
            return estimation;
        }



        Item item = getRelevantItem(items, adjustedQueuePlace);
        Optional<String> itemType = Optional.of(item.getType());
        int loanPeriod = getLoanPeriod(itemType.orElse("BOK"));

        DateTimeFormatter dateTimeFormatter = DateTimeFormat.forPattern("yyyy-MM-dd");

        double initialOffset = 0;
        if (item.getReturnDate() != null) {
            initialOffset = getOffset(dateTimeFormatter.parseDateTime(item.getReturnDate()));
        }
        int estimate = ((int) ((loanPeriod * getDistributedQueuePosition(adjustedQueuePlace, items.size()))
                + initialOffset)) + HANDLING_TIME;
        estimation.setEstimatedWait((estimate < CUTTOFF) ? estimate : CUTTOFF);

        return estimation;
    }

    private int getDistributedQueuePosition(int queuePlace, int items) {
        int queueRow;
        if (items > 1 && items < queuePlace) {
            queueRow = (int) ((Math.ceil(queuePlace / items) % queuePlace));
        } else {
            queueRow = queuePlace;
        }
        return queueRow;
    }

    private Item getRelevantItem(List<Item> items, int queuePlace) {
        int relevantItem;
        int numberOfItems = items.size();
        if (numberOfItems < queuePlace) {
            relevantItem = (int) (numberOfItems - (Math.ceil(queuePlace / numberOfItems) % queuePlace));
        } else if (numberOfItems == queuePlace) {
            relevantItem = queuePlace - 1;
        } else {
            relevantItem = queuePlace;
        }

        if (relevantItem > items.size() - 1) {
            relevantItem = items.size() - 1;
        }
        return items.get(relevantItem);
    }

    private double getOffset(DateTime onloan) {
        DateTime now = new DateTime();
        return Math.ceil(Days.daysBetween(now.toLocalDate(), onloan.toLocalDate()).getDays() / ONE_WEEK_IN_DAYS);
    }

    private int getLoanPeriod(String itemType) {
        int period;
        switch (itemType) {
            case "FILM":
            case "KART":
            case "MUSIKK":
            case "PERIODIKA":
                period = TWO_WEEKS;
                break;
            case "BOK":
            case "LYDBOK":
            case "NOTER":
            case "REALIA":
            case "SPILL":
            case "SPRAAKKURS":
            default:
                period = FOUR_WEEKS;
                break;
        }
        return period;
    }

    private boolean inTransit(int queuePlace) {
        return (queuePlace == 0);
    }

    private List<Item> reservableOf(List<Item> items) {
        return items.stream().filter(item -> item.isReservable()).collect(Collectors.toList());
    }

    private List<Item> availableOf(List<Item> items) {
        return items.stream().filter(item -> item.getReturnDate() == null).collect(Collectors.toList());
    }
}
