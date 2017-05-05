package no.deichman.services.entity.z3950;

import com.google.gson.annotations.SerializedName;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.google.common.collect.ImmutableMap.of;
import static no.deichman.services.entity.z3950.Publication.Extent.Paged;
import static no.deichman.services.entity.z3950.Publication.Extent.United;

/**
 * Responsibility: provide object for publications.
 */
@SuppressWarnings("checkstyle:DesignForExtension")
public class Publication extends BibliographicObjectExternal {

    /**
     * Whether publication has number of pages or an extent.
     */
    public enum Extent {
        Paged, United
    }

    Publication() {
    }

    @SerializedName("deichman:isbn")
    private String isbn;

    @SerializedName("deichman:hasEan")
    private String ean;

    @SerializedName("deichman:ismn")
    private String ismn;

    @SerializedName("deichman:binding")
    private ExternalDataObject binding;

    @SerializedName("deichman:edition")
    private String edition;

    @SerializedName("deichman:hasPlaceOfPublication")
    private Map<String, String> hasPlaceOfPublication;

    @SerializedName("deichman:publishedBy")
    private Map<String, String> publishedBy;

    @SerializedName("deichman:numberOfPages")
    private String numberOfPages;

    @SerializedName("deichman:hasExtent")
    private String extent;

    @SerializedName("deichman:hasPublicationPart")
    private List<Map<String, String>> hasPublicationPart;

    @SerializedName("deichman:publicationOf")
    private Map<String, String> publicationOf = new HashMap<>();

    @SerializedName("deichman:format")
    private ExternalDataObject format;

    @SerializedName("deichman:illustrativeMatter")
    private List illustrativeMatter;

    @SerializedName("deichman:inSerial")
    private List<Map<String, Object>> serial;

    @SerializedName("deichman:hasMediaType")
    private ExternalDataObject mediaType;

    @SerializedName("deichman:hasFormatAdaptation")
    private List<ExternalDataObject> formatAdaptation;

    @SerializedName("deichman:ageLimit")
    private Integer ageLimit;

    @SerializedName("deichman:hasSubtitles")
    private List<ExternalDataObject> hasSubtitles;

    @SerializedName("deichman:locationClassNumber")
    private String locationClassNumber;

    @SerializedName("deichman:locationSignature")
    private String locationSignature;

    @SerializedName("deichman:locationFormat")
    private String locationFormat;

    @SerializedName("deichman:hasPrimaryCataloguingSource")
    private ExternalDataObject cataloguingSource;

    @SerializedName("deichman:hasIdentifierInPrimaryCataloguingSource")
    private String cataloguingSourceIdentifier;

    private transient Extent extentType;

    public final String getIsbn() {
        return isbn;
    }

    final void setIsbn(String isbn) {
        this.isbn = isbn;
    }

    final void setIsmn(String ismn) {
        this.ismn = ismn;
    }


    public void setEan(String ean) {
        this.ean = ean;
    }

    final void setBinding(ExternalDataObject binding) {
        this.binding = binding;
    }

    final String getEdition() {
        return edition;
    }

    final void setEdition(String edition) {
        this.edition = edition;
    }

    final void setHasPlaceOfPublication(ExternalDataObject hasPlaceOfPublication) {
        this.hasPlaceOfPublication = of("@id", hasPlaceOfPublication.getId());
    }

    public final void setPublishedBy(ExternalDataObject publishedBy) {
        this.publishedBy = of("@id", publishedBy.getId());
    }

    final Map<String, String> getPublicationOf() {
        return this.publicationOf;
    }

    final void addPublicationPart(PublicationPart publicationPart) {
        if (hasPublicationPart == null) {
            hasPublicationPart = new ArrayList<>();
        }
        hasPublicationPart.add(of("@id", publicationPart.getId()));
    }


    @Override
    protected void assignType() {
        this.setType("deichman:Publication");
    }

    final void setPublicationOf(Work work) {
        this.publicationOf = of("@id", work.getId());
    }

    final void setCataloguingSource(ExternalDataObject cs) {
        this.cataloguingSource = cs;
    }

    final void setCataloguingSourceIdentifier(String identifier) {
        this.cataloguingSourceIdentifier = identifier;
    }

    public final void setFormat(ExternalDataObject format) {
        this.format = format;
    }

    public final void setUnitedMediaType(ExternalDataObject mediaType) {
        this.extentType = United;
        this.mediaType = mediaType;
    }

    public final void setPagedMediaType(ExternalDataObject mediaType) {
        this.extentType = Paged;
        this.mediaType = mediaType;
    }

    public final ExternalDataObject getFormat() {
        return format;
    }


    public void setIllustrativeMatter(ExternalDataObject illustrativeMatter) {
        if (this.illustrativeMatter == null) {
            this.illustrativeMatter = new ArrayList<>();
        }
        this.illustrativeMatter.add(illustrativeMatter);
    }

    public void setSerial(Map<String, Object> serial) {
        if (this.serial == null) {
            this.serial = new ArrayList<>();
        }
        this.serial.add(serial);
    }

    public void addFormatAdaption(ExternalDataObject formatAdaption) {
        if (this.formatAdaptation == null) {
            this.formatAdaptation = new ArrayList<>();
        }
        this.formatAdaptation.add(formatAdaption);
    }

    public void setAgeLimit(String ageLimit) {
        try {
            this.ageLimit = Integer.parseInt(ageLimit);
        } catch (NumberFormatException e) {
            // ignore
        }
    }

    public void addSubTitles(ExternalDataObject subTitles) {
        if (this.hasSubtitles == null) {
            this.hasSubtitles = new ArrayList<>();
        }
        this.hasSubtitles.add(subTitles);
    }

    public void locationClassNumber(String locationClassNumber) {
        this.locationClassNumber = locationClassNumber;
    }

    public void locationSignature(String locationSignature) {
        this.locationSignature = locationSignature;
    }

    public void locationFormat(String locationFormat) {
        this.locationFormat = locationFormat;
    }

    public void setExtent(String extent) {
        if (extentType == United) {
            this.extent = extent;
        } else {
            numberOfPages = extent;
        }
    }
}
