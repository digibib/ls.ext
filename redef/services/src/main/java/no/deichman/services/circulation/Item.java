package no.deichman.services.circulation;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

/**
 * Responsibility: hold data for items.
 */
public final class Item {
    @Expose
    @SerializedName("barcode")
    private String barcode;
    @Expose
    @SerializedName(value = "secondaryRecordId", alternate = "biblioitemnumber")
    private String secondaryRecordId;
    @Expose
    @SerializedName(value = "recordId", alternate = "biblionumber")
    private String recordId;
    @Expose
    @SerializedName(value = "bookSellerId", alternate = "booksellerid")
    private String bookSellerId;
    @Expose
    @SerializedName(value = "cCode", alternate = "ccode")
    private String cCode;
    @Expose
    @SerializedName(value = "cnSort", alternate = "cn_sort")
    private String cnSort;
    @Expose
    @SerializedName(value = "cnSource", alternate = "cn_source")
    private String cnSource;
    @Expose
    @SerializedName(value = "codedLocationQualifier", alternate = "coded_location_qualifier")
    private String codedLocationQualifier;
    @Expose
    @SerializedName(value = "copyNumber", alternate = "copynumber")
    private String copyNumber;
    @Expose
    @SerializedName("damaged")
    private String damaged;
    @Expose
    @SerializedName(value = "dateAccessioned", alternate = "dateaccessioned")
    private String dateAccessioned;
    @Expose
    @SerializedName(value = "dateLastBorrowed", alternate = "datelastborrowed")
    private String dateLastBorrowed;
    @Expose
    @SerializedName(value = "dateLastSeen", alternate = "datelastseen")
    private String dateLastSeen;
    @Expose
    @SerializedName(value = "enumChron", alternate = "enumchron")
    private String enumChron;
    @Expose
    @SerializedName(value = "holdingBranch", alternate = "holdingbranch")
    private String holdingBranch;
    @Expose
    @SerializedName(value = "homeBranch", alternate = "homebranch")
    private String homeBranch;
    @Expose
    @SerializedName("issues")
    private String issues;
    @Expose
    @SerializedName(value = "itemCallNumber", alternate = "itemcallnumber")
    private String itemCallNumber;
    @Expose
    @SerializedName(value = "itemLost", alternate = "itemlost")
    private String itemLost;
    @Expose
    @SerializedName(value = "itemLostOn", alternate = "itemlost_on")
    private String itemLostOn;
    @Expose
    @SerializedName(value = "itemNotes", alternate = "itemnotes")
    private String itemNotes;
    @Expose
    @SerializedName(value = "itemNotesNonPublic", alternate = "itemnotes_nonpublic")
    private String itemNotesNonPublic;
    @Expose
    @SerializedName(value = "id", alternate = "itemnumber")
    private String id;
    @Expose
    @SerializedName(value = "type", alternate = "itype")
    private String type;
    @Expose
    @SerializedName("location")
    private String location;
    @Expose
    @SerializedName("materials")
    private String materials;
    @Expose
    @SerializedName(value = "moreSubfieldsXml", alternate = "more_subfields_xml")
    private String moreSubfieldsXml;
    @Expose
    @SerializedName(value = "newStatus", alternate = "new_status")
    private String newStatus;
    @Expose
    @SerializedName(value = "notForLoan", alternate = "notforloan")
    private String notForLoan;
    @Expose
    @SerializedName(value = "returnDate", alternate = "onloan")
    private String returnDate;
    @Expose
    @SerializedName(value = "paidFor", alternate = "paidfor")
    private String paidFor;
    @Expose
    @SerializedName(value = "permanentLocation", alternate = "permanent_location")
    private String permanentLocation;
    @Expose
    @SerializedName("price")
    private String price;
    @Expose
    @SerializedName("renewals")
    private String renewals;
    @Expose
    @SerializedName(value = "replacementPrice", alternate = "replacementprice")
    private String replacementPrice;
    @Expose
    @SerializedName(value = "replacementPriceDate", alternate = "replacementpricedate")
    private String replacementPriceDate;
    @Expose
    @SerializedName("reservable")
    private int reservable;
    @Expose
    @SerializedName("reserves")
    private String reserves;
    @Expose
    @SerializedName("restricted")
    private String restricted;
    @Expose
    @SerializedName("stack")
    private String stack;
    @Expose
    @SerializedName("status")
    private String status;
    @Expose
    @SerializedName("stocknumber")
    private String stocknumber;
    @Expose
    @SerializedName("timestamp")
    private String timestamp;
    @Expose
    @SerializedName("uri")
    private String uri;
    @Expose
    @SerializedName("withdrawn")
    private String withdrawn;
    @Expose
    @SerializedName(value = "withdrawnOn", alternate = "withdrawn_on")
    private String withdrawnOn;

    public void setSecondaryRecordId(String secondaryRecordId) {
        this.secondaryRecordId = secondaryRecordId;
    }

    public void setRecordId(String recordId) {
        this.recordId = recordId;
    }

    public void setBookSellerId(String bookSellerId) {
        this.bookSellerId = bookSellerId;
    }

    public void setCCode(String cCode) {
        this.cCode = cCode;
    }

    public void setCnSort(String cnSort) {
        this.cnSort = cnSort;
    }

    public void setCnSource(String cnSource) {
        this.cnSource = cnSource;
    }

    public void setCodedLocationQualifier(String codedLocationQualifier) {
        this.codedLocationQualifier = codedLocationQualifier;
    }

    public void setCopyNumber(String copyNumber) {
        this.copyNumber = copyNumber;
    }

    public void setDamaged(String damaged) {
        this.damaged = damaged;
    }

    public void setDateAccessioned(String dateAccessioned) {
        this.dateAccessioned = dateAccessioned;
    }

    public void setDateLastBorrowed(String dateLastBorrowed) {
        this.dateLastBorrowed = dateLastBorrowed;
    }

    public void setDateLastSeen(String dateLastSeen) {
        this.dateLastSeen = dateLastSeen;
    }

    public void setEnumChron(String enumChron) {
        this.enumChron = enumChron;
    }

    public void setHoldingBranch(String holdingBranch) {
        this.holdingBranch = holdingBranch;
    }

    public void setHomeBranch(String homeBranch) {
        this.homeBranch = homeBranch;
    }

    public void setIssues(String issues) {
        this.issues = issues;
    }

    public void setItemCallNumber(String itemCallNumber) {

    }

    public void setItemLost(String itemLost) {
        this.itemLost = itemLost;
    }

    public void setItemLostOn(String itemLostOn) {
        this.itemLostOn = itemLostOn;
    }

    public void setItemNotes(String itemNotes) {
        this.itemNotes = itemNotes;
    }

    public void setItemNotesNonPublic(String itemNotesNonPublic) {
        this.itemNotesNonPublic = itemNotesNonPublic;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setReturnDate(String returnDate) {
        this.returnDate = returnDate;
    }

    public void setPaidFor(String paidFor) {
        this.paidFor = paidFor;
    }

    public void setPermanentLocation(String permanentLocation) {
        this.permanentLocation = permanentLocation;
    }

    public void setPrice(String price) {
        this.price = price;
    }

    public void setRenewals(String renewals) {
        this.renewals = renewals;
    }

    public void setReplacementPrice(String replacementPrice) {
        this.replacementPrice = replacementPrice;
    }

    public void setReplacementPriceDate(String replacementPriceDate) {
        this.replacementPriceDate = replacementPriceDate;
    }

    public void setReserves(String reserves) {
        this.reserves = reserves;
    }

    public void setRestricted(String restricted) {
        this.restricted = restricted;
    }

    public void setStack(String stack) {
        this.stack = stack;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setStocknumber(String stocknumber) {
        this.stocknumber = stocknumber;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public void setUri(String uri) {
        this.uri = uri;
    }

    public void setWithdrawn(String withdrawn) {
        this.withdrawn = withdrawn;
    }

    public void setWithdrawnOn(String withdrawnOn) {
        this.withdrawnOn = withdrawnOn;
    }

    public String getReturnDate() {
        return returnDate;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setMaterials(String materials) {
        this.materials = materials;
    }

    public void setMoreSubfieldsXml(String moreSubfieldsXml) {
        this.moreSubfieldsXml = moreSubfieldsXml;
    }

    public void setNewStatus(String newStatus) {
        this.newStatus = newStatus;
    }

    public void setNotForLoan(String notForLoan) {
        this.notForLoan = notForLoan;
    }

    public String getType() {
        return type;
    }

    public void setReservable(boolean reservable) {
        int returnValue = 0;
        if (reservable) {
            returnValue = 1;
        }
        this.reservable = returnValue;
    }

    public boolean isReservable() {
        boolean returnValue = false;
        if (reservable == 1) {
            returnValue = true;
        }
        return returnValue;
    }

    public void setBarcode(String barcode) {
        this.barcode = barcode;
    }
}
