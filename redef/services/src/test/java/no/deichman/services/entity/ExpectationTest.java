package no.deichman.services.entity;

import no.deichman.services.circulation.Item;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.junit.Test;
import org.joda.time.DateTime;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Random;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

/**
 * Responsibility: tests expectation class.
 */
public class ExpectationTest {

    public static final int FOUR_WEEKS_IN_DAYS = 28;
    public static final String BOK = "BOK";
    private static final int BOUND = 1000;

    @Test
    public void it_exists() {
        assertNotNull(new Exception());
    }

    @Test
    public void i_am_pending() {
        int queuePlace = 0;
        List<Item> items = Collections.singletonList(createAvailableItem(BOK));
        Expectation expectation = new Expectation();
        assertEquals(true, expectation.estimate(queuePlace, items, true).isPending());
    }

    @Test
    public void not_reservable() {
        //This state is in error, but we can probably end up here given the magic of what we're trying to do
        int queuePlace = 1;
        List<Item> items = Collections.singletonList(createUnreservableItem(BOK));
        boolean zeroUser = false;
        Expectation expectation = new Expectation();
        assertEquals("No reservable items", expectation.estimate(queuePlace, items, zeroUser).getError());
    }

    @Test
    public void available_but_not_effectuated() {
        int queuePlace = 1;
        List<Item> items = Collections.singletonList(createAvailableItem(BOK));
        boolean zeroUser = false;
        Expectation expectation = new Expectation();
        assertEquals(true, expectation.estimate(queuePlace, items, zeroUser).isPending());
    }

    @Test
    public void tests_one_waiting_max_wait() {
        int queuePlace = 1;
        Item item = createItem(FOUR_WEEKS_IN_DAYS, BOK);
        List<Item> items = Collections.singletonList(item);
        Expectation expectation = new Expectation();
        int expected = getExpectedWaitInWeeks(28, false);
        assertEquals(expected, expectation.estimate(queuePlace, items, false).getEstimatedWait());
    }

    private Item createItem(int offsetDays, String type) {
        DateTimeFormatter dateTimeFormatter = DateTimeFormat.forPattern("yyyy-MM-dd");
        Item item = createAvailableItem(type);
        item.setReturnDate(dateTimeFormatter.print(new DateTime().plusDays(offsetDays)));
        return item;
    }


    private Item createAvailableItem(String type) {
        Random random = new Random();
        Item item = new Item();
        item.setId(String.valueOf(random.nextInt(BOUND)));
        item.setType(type);
        item.setReservable(true);
        return item;
    }

    private Item createUnreservableItem(String type) {
        Item item = createAvailableItem(type);
        item.setReservable(false);
        return item;
    }
    @Test
    public void tests_queue_two_waiting_for_one() {
        int queuePlace = 2;
        boolean zeroBorrower = false;
        Item item = createItem(FOUR_WEEKS_IN_DAYS, BOK);
        List<Item> items = Collections.singletonList(item);
        Expectation expectation = new Expectation();
        int expected = getExpectedWaitInWeeks(56, zeroBorrower);
        assertEquals(expected, expectation.estimate(queuePlace, items, zeroBorrower).getEstimatedWait());
    }

    @Test
    public void test_three_waiting_for_one_unloaned() {
        boolean zerorBorrower = false;
        Item item = createItem(0, BOK);
        List<Item> items = Collections.singletonList(item);
        Expectation expectation = new Expectation();
        assertEquals(getExpectedWaitInWeeks(0, zerorBorrower), expectation.estimate(1, items, zerorBorrower).getEstimatedWait());
        assertEquals(getExpectedWaitInWeeks(28, zerorBorrower), expectation.estimate(2, items, zerorBorrower).getEstimatedWait());
        assertEquals(getExpectedWaitInWeeks(56, zerorBorrower), expectation.estimate(3, items, zerorBorrower).getEstimatedWait());
        assertEquals(getExpectedWaitInWeeks(84, zerorBorrower), expectation.estimate(4, items, zerorBorrower).getEstimatedWait());

    }

    @Test
    public void test_large_waiting_list_with_many_items() {
        boolean zeroBorrower = false;
        List<Item> items = new ArrayList<>();
        for (int i = 0; i < 40; i++) {
            items.add(createItem(0, BOK));
        }
        Expectation expectation = new Expectation();
        assertEquals(getExpectedWaitInWeeks(0, zeroBorrower), expectation.estimate(1, items, zeroBorrower).getEstimatedWait());
        assertEquals(getExpectedWaitInWeeks(28, zeroBorrower), expectation.estimate(56, items, zeroBorrower).getEstimatedWait());
        assertEquals(getExpectedWaitInWeeks(84, zeroBorrower), expectation.estimate(800, items, zeroBorrower).getEstimatedWait());
    }

    @Test
    public void test_three_items_seven_users() {
        boolean zeroBorrower = false;
        List<Item> items = new ArrayList<>();
        for (int i = 0; i < 3; i++) {
            items.add(createItem(0, BOK));
        }
        Expectation expectation = new Expectation();
        assertEquals(getExpectedWaitInWeeks(1, zeroBorrower), expectation.estimate(1, items, zeroBorrower).getEstimatedWait());
    }

    @Test
    public void test_queue_seven_three_items() {
        int queuePlace = 7;
        boolean zeroBorrower = false;
        List<Item> items = Arrays.asList(createItem(FOUR_WEEKS_IN_DAYS, BOK), createItem(FOUR_WEEKS_IN_DAYS, BOK), createItem(FOUR_WEEKS_IN_DAYS, BOK));
        Expectation expectation = new Expectation();
        int expected = getExpectedWaitInWeeks(84, zeroBorrower);
        assertEquals(expected, expectation.estimate(queuePlace, items, zeroBorrower).getEstimatedWait());
    }
    @Test
    public void test_queue_seven_three_items_minus_two_weeks() {
        int queuePlace = 7;
        boolean zeroBorrower = false;
        List<Item> items = Arrays.asList(createItem(14, BOK), createItem(14, BOK), createItem(14, BOK));
        Expectation expectation = new Expectation();
        int expected = getExpectedWaitInWeeks(70, zeroBorrower);
        assertEquals(expected, expectation.estimate(queuePlace, items, zeroBorrower).getEstimatedWait());
    }

    @Test
    public void test_queue_100_fifty_items() {
        int queuePlace = 100;
        boolean zeroBorrower = false;
        List<Item> items = new ArrayList<>();
        for (int i = 0; i < 50; i++) {
            items.add(createItem(FOUR_WEEKS_IN_DAYS, BOK));
        }
        int expected = getExpectedWaitInWeeks(56, zeroBorrower);
        Expectation expectation = new Expectation();
        assertEquals(expected, expectation.estimate(queuePlace, items, zeroBorrower).getEstimatedWait());
    }

    @Test
    public void test_queue_with_pending_loan() {
        int queuePlace = 1;
        boolean zeroBorrower = true;
        List<Item> items = Collections.singletonList(createItem(0, BOK));

        // You expected nothing, you were disappointed
        // Initially, I thought this was really stupid, but it reflects reality
        int expected = getExpectedWaitInWeeks(0, zeroBorrower);
        Expectation expectation = new Expectation();
        assertEquals(expected, expectation.estimate(queuePlace, items, zeroBorrower).getEstimatedWait());
    }

    @Test
    public void test_queue_with_spread_of_dates() {
        int queuePlace = 1;
        boolean zeroBorrower = true;
        Expectation expectation = new Expectation();
        List<Item> items;
        for (int i = 0; i < 57; i++) {
            int expected = getExpectedWaitInWeeks(i, zeroBorrower);
            items = Collections.singletonList(createItem(i, BOK));
            System.out.println("Testing " + i + " day's wait, got " + expected);
            assertEquals(expected, expectation.estimate(queuePlace, items, zeroBorrower).getEstimatedWait());
        }
    }

    private int getExpectedWaitInWeeks(int offsetInDays, boolean zeroBorrower) {
        int expected;
        if (offsetInDays< 7) {
            expected = 1;
        } else if (offsetInDays< 14) {
            expected = 2;
        } else if (offsetInDays< 21) {
            expected = 3;
        } else if (offsetInDays< 28) {
            expected = 4;
        } else if (offsetInDays< 35) {
            expected = 5;
        } else if (offsetInDays< 42) {
            expected = 6;
        } else if (offsetInDays< 49) {
            expected = 7;
        } else if (offsetInDays< 56) {
            expected = 8;
        } else if (offsetInDays< 63) {
            expected = 9;
        }  else if (offsetInDays< 70) {
            expected = 10;
        }  else if (offsetInDays< 77) {
            expected = 11;
        }  else {
            expected = 12;
        }
        int initialEstimate = (zeroBorrower) ? expected + 4 : expected;
        return (initialEstimate > 12) ? 12 : initialEstimate;
    }
}
