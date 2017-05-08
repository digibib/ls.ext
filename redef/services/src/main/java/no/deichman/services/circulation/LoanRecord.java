package no.deichman.services.circulation;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

import java.util.List;

/**
 * Responsibility: Provide a container object for library system manifestation records.
 */
public final class LoanRecord {
    @Expose
    @SerializedName("biblionumber")
    private String id;
    @Expose
    @SerializedName("collectionvolume")
    private String collectionVolume;
    @Expose
    @SerializedName("reserves")
    private String reserves;
    @Expose
    @SerializedName("renewals")
    private String renewals;
    @Expose
    @SerializedName("seriestitle")
    private String seriesTitle;
    @Expose
    @SerializedName("issues")
    private String issues;
    @Expose
    @SerializedName("cn_class")
    private String cnClass;
    @Expose
    @SerializedName("number")
    private String number;
    @Expose
    @SerializedName("paidfor")
    private String paidFor;
    @Expose
    @SerializedName("itemlost_on") // "2017-02-15 02:00:29"
    private String itemLostOn;
    @Expose
    @SerializedName("itemcallnumber")
    private String itemCallNumber;
    @Expose
    @SerializedName("location")
    private String location;
    @Expose
    @SerializedName("pages")
    private String pages;
    @Expose
    @SerializedName("ean")
    private String ean;
    @Expose
    @SerializedName("lccn")
    private String lccn;
    @Expose
    @SerializedName("editionstatement")
    private String editionStatement;
    @Expose
    @SerializedName("biblioitemnumber")
    private String biblioItemNumber;
    @Expose
    @SerializedName("timestamp") // "2016-10-08 23:09:14"
    private String timestamp;
    @Expose
    @SerializedName("notforloan")
    private String notForLoan;
    @Expose
    @SerializedName("homebranch")
    private String homeBranch;
    @Expose
    @SerializedName("price")
    private String price;
    @Expose
    @SerializedName("barcode")
    private String barcode;
    @Expose
    @SerializedName("onloan") // "2017-01-10"
    private String onLoan;
    @Expose
    @SerializedName("cn_item")
    private String cnItem;
    @Expose
    @SerializedName("url")
    private String url;
    @Expose
    @SerializedName("copyrightdate")
    private String copyRightDate;
    @Expose
    @SerializedName("datelastborrowed") //"2016-10-18"
    private String dateLastBorrowed;
    @Expose
    @SerializedName("size")
    private String size;
    @Expose
    @SerializedName("itemnotes")
    private String itemNotes;
    @Expose
    @SerializedName("notes")
    private String notes;
    @Expose
    @SerializedName("stocknumber")
    private String stockNumber;
    @Expose
    @SerializedName("restricted")
    private String restricted;
    @Expose
    @SerializedName("withdrawn_on")
    private String withdrawnOn;
    @Expose
    @SerializedName("stack")
    private String stack;
    @Expose
    @SerializedName("itemlost")
    private String itemLost;
    @Expose
    @SerializedName("replacementpricedate") // "2016-10-07"
    private String replacementPriceDate;
    @Expose
    @SerializedName("datelastseen") // "2016-10-18",
    private String dateLastSeen;
    @Expose
    @SerializedName("issn")
    private String issn;
    @Expose
    @SerializedName("uri")
    private String uri;
    @Expose
    @SerializedName("materials")
    private String materials;
    @Expose
    @SerializedName("frameworkcode")
    private String frameworkCode;
    @Expose
    @SerializedName("cn_sort")
    private String cnSort;
    @Expose
    @SerializedName("publishercode")
    private String publisherCode;
    @Expose
    @SerializedName("withdrawn")
    private String withdrawn;
    @Expose
    @SerializedName("damaged")
    private String damaged;
    @Expose
    @SerializedName("marcxml")
    private String marcXml;
    @Expose
    @SerializedName("holdingbranch")
    private String holdingBranch;
    @Expose
    @SerializedName("editionresponsibility")
    private String editionResponsibility;
    @Expose
    @SerializedName("volume")
    private String volume;
    @Expose
    @SerializedName("cn_source")
    private String cnSource;
    @Expose
    @SerializedName("title")
    private String title;
    @Expose
    @SerializedName("author")
    private String author;
    @Expose
    @SerializedName("copynumber")
    private String copyNumber;
    @Expose
    @SerializedName("cn_suffix")
    private String cnSuffix;
    @Expose
    @SerializedName("itype")
    private String iType;
    @Expose
    @SerializedName("abstract")
    private String abstractText;
    @Expose
    @SerializedName("totalissues")
    private String totalIssues;
    @Expose
    @SerializedName("unititle")
    private String uniformTitle;
    @Expose
    @SerializedName("isbn") //"978-82-02-25363-9 | 82-02-25363-2"
    private String isbn;
    @Expose
    @SerializedName("replacementprice")
    private String replacementPrice;
    @Expose
    @SerializedName("itemnotes_nonpublic")
    private String itemNotesNonPublic;
    @Expose
    @SerializedName("ccode")
    private String cCode;
    @Expose
    @SerializedName("datecreated") // "2016-10-07"
    private String dateCreated;
    @Expose
    @SerializedName("more_subfields_xml")
    private String moreSubfieldsXml;
    @Expose
    @SerializedName("coded_location_qualifier")
    private String codedLocationQualifier;
    @Expose
    @SerializedName("publicationyear")
    private String publicationYear;
    @Expose
    @SerializedName("permanent_location")
    private String permanentLocation;
    @Expose
    @SerializedName("volumedesc")
    private String volumeDescription;
    @Expose
    @SerializedName("collectiontitle")
    private String collectionTitle;
    @Expose
    @SerializedName("serial")
    private String serial;
    @Expose
    @SerializedName("volumedate")
    private String volumeDate;
    @Expose
    @SerializedName("new_status")
    private String newStatus;
    @Expose
    @SerializedName("itemtype")
    private String itemType;
    @Expose
    @SerializedName("agerestriction")
    private String ageRestriction;
    @Expose
    @SerializedName("collectionissn")
    private String collectionIssn;
    @Expose
    @SerializedName("place")
    private String place;
    @Expose
    @SerializedName("illus")
    private String illustrated;
    @Expose
    @SerializedName("dateaccessioned") // "2016-10-07"
    private String dateAccessioned;
    @Expose
    @SerializedName("enumchron")
    private String enumChron;
    @Expose
    @SerializedName("booksellerid")
    private String booksellerId;
    @Expose
    @SerializedName("items")
    private List<Item> items;
    @Expose
    @SerializedName(value = "pendingExpidition", alternate = "behindExpiditedUser")
    private String pendingExpidition;

    public List<Item> getItems() {
        return items;
    }

    public boolean getPendingExpidition() {
        boolean returnValue = true;
        if (pendingExpidition.equals("0")) {
            returnValue = false;
        }
        return returnValue;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
}
