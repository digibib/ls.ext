package no.deichman.services.entity.z3950;

import org.junit.Test;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;


/**
 * Responsibility: test publication object.
 */
public class PublicationTest {

    @Test
    public void test_constructor() {
        assertNotNull(new Publication());
    }

    @Test
    public void can_set_all_fields() {
        Publication publication = new Publication();
        String binding = "ib.";
        String placeOfPublication = "Oslo";
        String isbn = "978-009-11-1232-1";
        String edition = "1. utgave";
        String language = "en";
        String numberOfPages = "208 s.";
        String publisher = "Gruber";
        String isPublicationOf = "_:090999992";
        String publicationYear = "1997";
        String contributor = "_:998222121";
        Map<String, String> contribution = new HashMap<>();
        contribution.put("@id", contributor);
        List<Map<String, String>> contributorList = new ArrayList<>();
        contributorList.add(contribution);

        publication.setBinding(binding);
        publication.setPlaceOfPublication(placeOfPublication);
        publication.setIsbn(isbn);
        publication.setEdition(edition);
        publication.setLanguage(language);
        publication.setNumberOfPages(numberOfPages);
        publication.setPublisher(publisher);
        publication.setPublicationOf(isPublicationOf);
        publication.setPublicationYear(publicationYear);
        publication.setContributor(contributor);

        assertEquals(binding, publication.getBinding());
        assertEquals(placeOfPublication, publication.getPlaceOfPublication());
        assertEquals(isbn, publication.getIsbn());
        assertEquals(edition, publication.getEdition());
        assertEquals(language, publication.getLanguage());
        assertEquals(numberOfPages, publication.getNumberOfPages());
        assertEquals(publisher, publication.getPublisher());
        assertEquals(isPublicationOf, publication.getPublicationOf().get("@id"));
        assertEquals(publicationYear, publication.getPublicationYear());
        assertEquals(contributorList, publication.getContributor());
    }
}
