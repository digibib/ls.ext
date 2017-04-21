package no.deichman.services.circulation;

import com.google.gson.annotations.SerializedName;

import java.util.List;

/**
 * Responsibility: Provide a container object for library system manifestation records.
 */
public class LoanRecord extends CirculationObjectBase {

    @SerializedName("collectionvolume")
    private String collectionVolume;
    @SerializedName("reserves")
    private String reserves;
    @SerializedName("renewals")
    private String renewals;
    @SerializedName("seriestitle")
    private String seriesTitle;
    @SerializedName("issues")
    private String issues;
    @SerializedName("cn_class")
    private String cnClass;
    @SerializedName("number")
    private String number;
    @SerializedName("paidfor")
    private String paidFor;
    @SerializedName("itemlost_on") // "2017-02-15 02:00:29"
    private String itemLostOn;
    @SerializedName("itemcallnumber")
    private String itemCallNumber;
    @SerializedName("location")
    private String location;
    @SerializedName("pages")
    private String pages;
    @SerializedName("ean")
    private String ean;
    @SerializedName("lccn")
    private String lccn;
    @SerializedName("editionstatement")
    private String editionStatement;
    @SerializedName("biblioitemnumber")
    private String biblioItemNumber;
    @SerializedName("timestamp") // "2016-10-08 23:09:14"
    private String timestamp;
    @SerializedName("notforloan")
    private String notForLoan;
    @SerializedName("homebranch")
    private String homeBranch;
    @SerializedName("price")
    private String price;
    @SerializedName("barcode")
    private String barcode;
    @SerializedName("onloan") // "2017-01-10"
    private String onLoan;
    @SerializedName("cn_item")
    private String cnItem;
    @SerializedName("url")
    private String url;
    @SerializedName("copyrightdate")
    private String copyRightDate;
    @SerializedName("datelastborrowed") //"2016-10-18"
    private String dateLastBorrowed;
    @SerializedName("size")
    private String size;
    @SerializedName("itemnotes")
    private String itemNotes;
    @SerializedName("notes")
    private String notes;
    @SerializedName("stocknumber")
    private String stockNumber;
    @SerializedName("restricted")
    private String restricted;
    @SerializedName("withdrawn_on")
    private String withdrawnOn;
    @SerializedName("stack")
    private String stack;
    @SerializedName("itemlost")
    private String itemLost;
    @SerializedName("replacementpricedate") // "2016-10-07"
    private String replacementPriceDate;
    @SerializedName("datelastseen") // "2016-10-18",
    private String dateLastSeen;
    @SerializedName("issn")
    private String issn;
    @SerializedName("uri")
    private String uri;
    @SerializedName("materials")
    private String materials;
    @SerializedName("frameworkcode")
    private String frameworkCode;
    @SerializedName("cn_sort")
    private String cnSort;
    @SerializedName("publishercode")
    private String publisherCode;
    @SerializedName("withdrawn")
    private String withdrawn;
    @SerializedName("damaged")
    private String damaged;
    @SerializedName("marcxml")
    private String marcXml;
    @SerializedName("holdingbranch")
    private String holdingBranch;
    @SerializedName("editionresponsibility")
    private String editionResponsibility;
    @SerializedName("volume")
    private String volume;
    @SerializedName("cn_source")
    private String cnSource;
    @SerializedName("title")
    private String title;
    @SerializedName("author")
    private String author;
    @SerializedName("copynumber")
    private String copyNumber;
    @SerializedName("cn_suffix")
    private String cnSuffix;
    @SerializedName("itype")
    private String iType;
    @SerializedName("abstract")
    private String abstractText;
    @SerializedName("totalissues")
    private String totalIssues;
    @SerializedName("unititle")
    private String uniformTitle;
    @SerializedName("isbn") //"978-82-02-25363-9 | 82-02-25363-2"
    private String isbn;
    @SerializedName("replacementprice")
    private String replacementPrice;
    @SerializedName("itemnotes_nonpublic")
    private String itemNotesNonPublic;
    @SerializedName("ccode")
    private String cCode;
    @SerializedName("datecreated") // "2016-10-07"
    private String dateCreated;
    @SerializedName("more_subfields_xml")
    private String moreSubfieldsXml;
    @SerializedName("coded_location_qualifier")
    private String codedLocationQualifier;
    @SerializedName("publicationyear")
    private String publicationYear;
    @SerializedName("permanent_location")
    private String permanentLocation;
    @SerializedName("volumedesc")
    private String volumeDescription;
    @SerializedName("collectiontitle")
    private String collectionTitle;
    @SerializedName("serial")
    private String serial;
    @SerializedName("volumedate")
    private String volumeDate;
    @SerializedName("new_status")
    private String newStatus;
    @SerializedName("itemtype")
    private String itemType;
    @SerializedName("agerestriction")
    private String ageRestriction;
    @SerializedName("collectionissn")
    private String collectionIssn;
    @SerializedName("place")
    private String place;
    @SerializedName("illus")
    private String illustrated;
    @SerializedName("dateaccessioned") // "2016-10-07"
    private String dateAccessioned;
    @SerializedName("enumchron")
    private String enumChron;
    @SerializedName("booksellerid")
    private String booksellerId;
    @SerializedName("items")
    private List<Item> items;
    @SerializedName(value = "pendingExpidition", alternate = "behindExpiditedUser")
    private String pendingExpidition;

    public final List<Item> getItems() {
        return items;
    }

    public final boolean getPendingExpidition() {
        boolean returnValue = true;
        if (pendingExpidition.equals("0")) {
            returnValue = false;
        }
        return returnValue;
    }
}
