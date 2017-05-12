package no.deichman.services.entity;

import no.deichman.services.circulation.Item;
import org.apache.commons.lang3.tuple.ImmutablePair;
import org.apache.commons.lang3.tuple.Pair;
import org.joda.time.DateTime;
import org.joda.time.Days;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Responsibility: provides an estimate for expected availability dates.
 */
final class Expectation {

    private static final int ONE_WEEK_IN_DAYS = 7;
    private static final int ONE_PLACE_ADJUSTMENT = 1;
    private static final int HANDLING_TIME = 1;
    private static final int TWO_WEEKS = 2;
    private static final int FOUR_WEEKS = 4;
    private static final int CUTOFF = 12;

    Estimation estimate(int queuePlace, List<Item> items, boolean precedingZeroUser) {
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

        int loanPeriod = getLoanPeriod(items.get(0).getType());

        int estimate =  (isDistantLoan(reservableItems.size(), adjustedQueuePlace, loanPeriod)) ?
            12 : guess(queuePlace, reservableItems, precedingZeroUser, loanPeriod);

        estimation.setEstimatedWait((estimate < CUTOFF) ? estimate : CUTOFF);

        return estimation;
    }

    private boolean isDistantLoan(int reservableItems, int adjustedQueuePlace, int loanPeriod) {
        return (adjustedQueuePlace > reservableItems && (reservableItems / adjustedQueuePlace) * loanPeriod > 11);
    }

    private int getOffset(String onLoan) {
        int offset = 0;
        if (onLoan != null) {
            DateTimeFormatter dateTimeFormatter = DateTimeFormat.forPattern("yyyy-MM-dd");
            DateTime now = new DateTime();
            int daysBetween = Days.daysBetween(now.toLocalDate(), dateTimeFormatter.parseDateTime(onLoan).toLocalDate()).getDays();
            offset = (daysBetween < 1) ? 0 : (int) (Math.ceil(daysBetween / ONE_WEEK_IN_DAYS));
        }
        return offset;
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

    private List<Item> reservableOf(List<Item> items) {
        return items.stream().filter(Item::isReservable).collect(Collectors.toList());
    }

    private List<Item> availableOf(List<Item> items) {
        return items.stream().filter(item -> item.getReturnDate() == null).collect(Collectors.toList());
    }

    private int guess(int queuePlace, List<Item> items, boolean zeroUser, int loanPeriod) {
        int adjustedQueuePlace = (zeroUser) ? queuePlace + 1 : queuePlace;
        Pair queueRowAndItem = getMatrixPosition(adjustedQueuePlace, items.size());
        int queueRow = (int) queueRowAndItem.getLeft();
        int relevantItem = (int) queueRowAndItem.getRight();
        int weeksUntilNextRelevantStatusChange = getOffset(items.get(relevantItem).getReturnDate());
        int adjustedQueueRow = (queueRow == 0) ? 0 : queueRow - 1;
        int estimate = (queueRow == 1) ? weeksUntilNextRelevantStatusChange : (loanPeriod * adjustedQueueRow) + weeksUntilNextRelevantStatusChange;
        return estimate + HANDLING_TIME;
    }

    private Pair getMatrixPosition(int queuePlace, int items) {
        Pair<Integer, Integer> returnValue = null;
        int b = (queuePlace + (items - (queuePlace % items))) / items;
        int[][] matrix = new int[b][items];
        int increment = 1;
        for (int left = 0; left < b; left++) {
            for (int right = 0; right < items; right++) {
                matrix[left][right] = increment;
                if (increment == queuePlace) {
                    returnValue = new ImmutablePair<>(left, right);
                    break;
                }
                increment++;
            }
        }
        return returnValue;
    }
}
