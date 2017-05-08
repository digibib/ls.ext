package no.deichman.services.circulation;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

/**
 * Responsibility: container object for bibliographic record data.
 */
public final class Record {
    @Expose
    @SerializedName("abstract")
    private String abztract;
    @Expose
    @SerializedName("author")
    private String author;
    @Expose
    @SerializedName("behindExpiditedUser")
    private int behindExpiditedUser;
    @Expose
    @SerializedName(value = "id", alternate = "biblionumber")
    private String id;
    @Expose
    @SerializedName(value = "copyrightDate", alternate = "copyrightdate")
    private String copyrightDate;
    @Expose
    @SerializedName(value = "dateCreated", alternate = "datecreated")
    private String dateCreated;
    @Expose
    @SerializedName(value = "frameworkCode", alternate = "frameworkcode")
    private String frameworkCode;
    @Expose
    @SerializedName("notes")
    private String notes;
    @Expose
    @SerializedName(value = "numberOfHolds", alternate = "numholds")
    private int numberOfHolds;
    @Expose
    @SerializedName("serial")
    private String serial;
    @Expose
    @SerializedName(value = "seriesTitle", alternate = "seriestitle")
    private String seriesTitle;
    @Expose
    @SerializedName("timestamp")
    private String timestamp;
    @Expose
    @SerializedName("title")
    private String title;
    @Expose
    @SerializedName(value = "uniformTitle", alternate = "unititle")
    private String uniformTitle;

    public void setAbstract(String abztract) {
        this.abztract = abztract;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public void setBehindExpiditedUser(int zeroUser) {
        this.behindExpiditedUser = zeroUser;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setCopyrightDate(String copyrightDate) {
        this.copyrightDate = copyrightDate;
    }

    public void setDateCreated(String dateCreated) {
        this.dateCreated = dateCreated;
    }

    public void setFrameworkCode(String frameworkCode) {
        this.frameworkCode = frameworkCode;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public void setNumberOfHolds(int numberOfHolds) {
        this.numberOfHolds = numberOfHolds;
    }

    public void setSerial(String serial) {
        this.serial = serial;
    }

    public void setSeriesTitle(String seriesTitle) {
        this.seriesTitle = seriesTitle;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setUniformTitle(String uniformTitle) {
        this.uniformTitle = uniformTitle;
    }

    public boolean getBehindExpiditedUserAsBoolean() {
        boolean returnValue = false;
        if (this.behindExpiditedUser == 1) {
            returnValue = true;
        }
        return returnValue;
    }

    public void setBehindExpiditedUser(boolean expiditedUser) {
        this.behindExpiditedUser = (expiditedUser) ? 1 : 0;
    }

    public String getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }
}
