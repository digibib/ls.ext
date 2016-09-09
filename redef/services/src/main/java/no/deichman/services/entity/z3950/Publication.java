package no.deichman.services.entity.z3950;

import com.google.gson.annotations.SerializedName;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.google.common.collect.ImmutableMap.of;

/**
 * Responsibility: provide object for publications.
 */
@SuppressWarnings("checkstyle:DesignForExtension")
public class Publication extends BibliographicObjectExternal {

    @SerializedName("deichman:isbn")
    private String isbn;

    @SerializedName("deichman:binding")
    private String binding;

    @SerializedName("deichman:edition")
    private String edition;

    @SerializedName("deichman:placeOfPublication")
    private Map<String, String> placeOfPublication;

    @SerializedName("deichman:publisher")
    private String publisher;

    @SerializedName("deichman:numberOfPages")
    private String numberOfPages;

    @SerializedName("deichman:language")
    private List<ExternalDataObject> language;

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

    public final String getIsbn() {
        return isbn;
    }

    final void setIsbn(String isbn) {
        this.isbn = isbn;
    }

    final String getBinding() {
        return binding;
    }

    final void setBinding(String binding) {
        this.binding = binding;
    }

    final String getEdition() {
        return edition;
    }

    final void setEdition(String edition) {
        this.edition = edition;
    }

    final void setPlaceOfPublication(ExternalDataObject placeOfPublication) {
        this.placeOfPublication = of("@id", placeOfPublication.getId());
    }

    public final String getPublisher() {
        return publisher;
    }

    public final void setPublisher(String publisher) {
        this.publisher = publisher;
    }

    final String getNumberOfPages() {
        return numberOfPages;
    }

    final void setNumberOfPages(String numberOfPages) {
        this.numberOfPages = numberOfPages;
    }

    public final void addLanguage(ExternalDataObject language) {
        if (this.language == null) {
            this.language = new ArrayList<>();
        }
        this.language.add(language);
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

    Publication() {
    }

    @Override
    protected void assignType() {
        this.setType("deichman:Publication");
    }

    final void setPublicationOf(Work work) {
        this.publicationOf = of("@id", work.getId());
    }

    public final void setFormat(ExternalDataObject format) {
        this.format = format;
    }

    public final void setMediaType(ExternalDataObject mediaType) {
        this.mediaType = mediaType;
    }

    public final ExternalDataObject getFormat() {
        return format;
    }


    public Map<String, String> getPlaceOfPublication() {
        return placeOfPublication;
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

}
