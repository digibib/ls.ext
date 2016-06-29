package no.deichman.services.entity.z3950;

import com.google.gson.annotations.SerializedName;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Responsibility: provide object for publications.
 */
public class Publication extends BibliographicObjectExternal {

    @SerializedName("deichman:isbn")
    private String isbn;
    @SerializedName("deichman:binding")
    private String binding;
    @SerializedName("deichman:edition")
    private String edition;
    @SerializedName("deichman:placeOfPublication")
    private String placeOfPublication;
    @SerializedName("deichman:publisher")
    private String publisher;
    @SerializedName("deichman:publicationYear")
    private String publicationYear;
    @SerializedName("deichman:numberOfPages")
    private String numberOfPages;
    @SerializedName("deichman:language")
    private String language;
    @SerializedName("deichman:contributor")
    private List<Map<String, String>> contributor = new ArrayList<>();
    @SerializedName("deichman:publicationOf")
    private Map<String, String> publicationOf = new HashMap<>();

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

    final String getPlaceOfPublication() {
        return placeOfPublication;
    }

    final void setPlaceOfPublication(String placeOfPublication) {
        this.placeOfPublication = placeOfPublication;
    }

    public final String getPublisher() {
        return publisher;
    }

    public final void setPublisher(String publisher) {
        this.publisher = publisher;
    }

    public final String getPublicationYear() {
        return publicationYear;
    }

    public final void setPublicationYear(String publicationYear) {
        this.publicationYear = publicationYear;
    }

    final String getNumberOfPages() {
        return numberOfPages;
    }

    final void setNumberOfPages(String numberOfPages) {
        this.numberOfPages = numberOfPages;
    }

    public final String getLanguage() {
        return language;
    }

    public final void setLanguage(String language) {
        this.language = language;
    }

    final List<Map<String, String>> getContributor() {
        return contributor;
    }

    final Map<String, String> getPublicationOf() {
        return this.publicationOf;
    }

    final void setContributor(String publicationContributor) {
        Map<String, String> contribution = new HashMap<>();
        contribution.put("@id", publicationContributor);
        this.contributor.add(contribution);
    }

    Publication() {
        this.setType("deichman:Publication");
    }

    final void setPublicationOf(String publicationOf) {
        Map<String, String> map = new HashMap<>();
        map.put("@id", this.bNodize(publicationOf));
        this.publicationOf = map;
    }
}
