package no.deichman.services.entity.kohaadapter;

import no.deichman.services.circulation.Item;
import no.deichman.services.testutil.RandomisedData;
import org.apache.commons.lang3.RandomStringUtils;

/**
 * Responsibility: provide an easy way to create item objects for use in tests.
 */
public final class ItemStubber {

    private ItemStubber() {}

    public static Item generateRandom(String recordId, String type, String returnDate, int reservable) {

        Item item = new Item();

        boolean booleanReservable = false;
        if (reservable == 1) {
            booleanReservable = true;
        }

        RandomisedData randomDate = new RandomisedData();
        item.setBarcode(RandomStringUtils.randomNumeric(14));
        item.setSecondaryRecordId(recordId);
        item.setRecordId(recordId);
        item.setBookSellerId(null);
        item.setCCode(null);
        item.setCnSort(RandomStringUtils.random(5));
        item.setCnSource(RandomStringUtils.random(5));
        item.setCodedLocationQualifier(RandomStringUtils.random(5));
        item.setCopyNumber(RandomStringUtils.randomNumeric(1));
        item.setDamaged("0");
        item.setDateAccessioned(randomDate.getTimestamp());
        item.setDateLastBorrowed(randomDate.getTimestamp());
        item.setDateLastSeen(randomDate.getTimestamp());
        item.setEnumChron(null);
        item.setHoldingBranch(RandomStringUtils.random(4));
        item.setHomeBranch(RandomStringUtils.random(4));
        item.setIssues(RandomStringUtils.randomNumeric(1));
        item.setItemCallNumber(RandomStringUtils.random(7));
        item.setItemLost(null);
        item.setItemLostOn(null);
        item.setItemNotes(RandomStringUtils.random(25));
        item.setItemNotesNonPublic(RandomStringUtils.random(25));
        item.setId(recordId);
        item.setType(type);
        item.setLocation(RandomStringUtils.random(4));
        item.setMaterials(RandomStringUtils.random(6));
        item.setMoreSubfieldsXml(RandomStringUtils.random(25));
        item.setNewStatus(null);
        item.setNotForLoan(null);
        item.setReturnDate(returnDate);
        item.setPaidFor(null);
        item.setPermanentLocation(RandomStringUtils.random(4));
        item.setPrice(null);
        item.setRenewals(null);
        item.setReplacementPrice(null);
        item.setReplacementPriceDate(null);
        item.setReservable(booleanReservable);
        item.setReserves(null);
        item.setRestricted(null);
        item.setReturnDate(returnDate);
        item.setStack(null);
        item.setStatus((returnDate == null) ? "" : "Utlånt");
        item.setStocknumber(null);
        item.setTimestamp(randomDate.getTimestamp());
        item.setUri(null);
        item.setWithdrawn("0");
        item.setWithdrawnOn(null);

        return item;
    }
}
