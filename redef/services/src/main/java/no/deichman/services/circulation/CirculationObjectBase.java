package no.deichman.services.circulation;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;
import java.util.Map;

/**
 * Responsibility: Top-level object for circulation data.
 */
class CirculationObjectBase implements CirculationObject {

    @Expose
    @SerializedName(value = "recordId", alternate = "biblionumber")
    private String recordId;
    @SerializedName(value = "borrowerNumber", alternate = "borrowernumber")
    private String borrowerNumber;
    @Expose
    private String workURI;
    @Expose
    private String publicationURI;
    @Expose
    private String publicationImage;
    @Expose
    private Map<String, String> contributor;
    @Expose
    private String mediaType;
    @Expose
    @SerializedName(value = "branchCode", alternate = "branchcode")
    private String branchCode;
    @Expose
    private String title;
    @Expose
    private String publicationYear;
    @Expose
    private String relativePublicationPath;
    private String status;
    @Expose
    @SerializedName(value = "id", alternate = {"issue_id", "reserve_id"})
    private String id;

    public void setRecordId(String recordId) {
        this.recordId = recordId;
    }

    public String getRecordId() {
        return this.recordId;
    }

    public void setWorkURI(String workURI) {
        this.workURI = workURI;
    }

    public void setPublicationURI(String publicationUri) {
        this.publicationURI = publicationUri;
    }

    public void setPublicationImage(String publicationImage) {
        this.publicationImage = publicationImage;
    }

    public void setContributor(Map<String, String> contributor) {
        this.contributor = contributor;
    }

    public void setMediaType(String mediaType) {
        this.mediaType = mediaType;
    }

    @Override
    public String getWorkURI() {
        return workURI;
    }

    @Override
    public String getPublicationURI() {
        return publicationURI;
    }

    @Override
    public void setRelativePublicationPath(String relativePublicationPath) {
        this.relativePublicationPath = relativePublicationPath;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getPublicationYear() {
        return publicationYear;
    }

    public void setPublicationYear(String publicationYear) {
        this.publicationYear = publicationYear;
    }

    @Override
    public String getStatus() {
        return status;
    }

    @Override
    public void setBranchCode(String branchCode) {
        this.branchCode = branchCode;
    }

    @Override
    public void setId(String id) {
        this.id = id;
    }

}
