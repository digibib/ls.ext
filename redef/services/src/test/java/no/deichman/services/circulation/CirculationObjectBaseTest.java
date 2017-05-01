package no.deichman.services.circulation;

import no.deichman.services.entity.EntityType;
import no.deichman.services.testutil.RandomisedData;
import no.deichman.services.uridefaults.BaseURI;
import no.deichman.services.uridefaults.XURI;
import org.junit.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

/**
 * Responsibility: Test CirculationObjectBase class.
 */
public class CirculationObjectBaseTest {
    @Test
    public void it_exists() {
        assertNotNull(new CirculationObjectBase());
    }

    @Test
    public void test_basic_properties() {
        String recordId = RandomisedData.randomNumericID();
        String id = RandomisedData.randomNumericID();
        String publicationYear = "&copy; " + RandomisedData.randomYear();
        String title = RandomisedData.randomTitle();
        String borrowerNumber = RandomisedData.randomNumericID();
        String branchCode = RandomisedData.randomString(4);
        CirculationObjectBase circulationObjectBase = new CirculationObjectBase();
        circulationObjectBase.setRecordId(recordId);
        circulationObjectBase.setId(id);
        circulationObjectBase.setPublicationYear(publicationYear);
        circulationObjectBase.setTitle(title);
        circulationObjectBase.setBorrowerNumber(borrowerNumber);
        circulationObjectBase.setBranchCode(branchCode);

        assertEquals(recordId, circulationObjectBase.getRecordId());
        assertEquals(id, circulationObjectBase.getId());
        assertEquals(publicationYear, circulationObjectBase.getPublicationYear());
        assertEquals(title, circulationObjectBase.getTitle());
        assertEquals(borrowerNumber, circulationObjectBase.getBorrowerNumber());
        assertEquals(branchCode, circulationObjectBase.getBranchCode());
    }

    @Test
    public void test_metadata_decoration() throws Exception {
        Map<String, String> publicationData = publicationData();
        String id = RandomisedData.randomNumericID();
        XURI publicationXuri = new XURI(publicationData.get("publicationUri"));
        XURI workXuri = new XURI(publicationData.get("workUri"));
        String publicationRelativePath = workXuri.getPath() + publicationXuri.getPath();
        Map<String, String> contributor = new HashMap<>();
        contributor.put("role", publicationData.get("role"));
        contributor.put("agentUri", publicationData.get("agentUri"));
        contributor.put("contributorName", publicationData.get("contributorName"));
        contributor.put("contributorNationality", publicationData.get("contributorNationality"));

        CirculationObjectBase circulationObject = new CirculationObjectBase();
        circulationObject.setRecordId(id);
        circulationObject.decorateWithPublicationData(publicationData);
        assertEquals(id, circulationObject.getRecordId());
        assertEquals(publicationData.get("workUri"), circulationObject.getWorkURI());
        assertEquals(publicationData.get("publicationUri"), circulationObject.getPublicationURI());
        assertEquals(publicationRelativePath, circulationObject.getRelativePublicationPath());
        assertEquals(publicationData.get("mediaType"), circulationObject.getMediaType());
        assertEquals(publicationData.get("publicationImage"), circulationObject.getPublicationImage());
        assertEquals(contributor, circulationObject.getContributor());
    }

    private Map<String, String> publicationData() throws Exception {
        Map<String, String> publicationData = new HashMap<>();
        publicationData.put("title", RandomisedData.randomTitle());
        publicationData.put("mediaType", RandomisedData.randomMediaType());
        publicationData.put("publicationImage", RandomisedData.randomURL());
        publicationData.put("publicationUri", RandomisedData.randomURI(EntityType.PUBLICATION));
        publicationData.put("publicationYear", RandomisedData.randomYear());
        publicationData.put("workUri", RandomisedData.randomURI(EntityType.WORK));
        publicationData.put("agentUri", new XURI(BaseURI.root(), EntityType.PERSON.getPath(), 'h' + RandomisedData.randomNumericID()).getUri());
        publicationData.put("contributorName", RandomisedData.randomInvertedName());
        publicationData.put("contributorNationality", RandomisedData.randomNationality());
        publicationData.put("role", RandomisedData.randomRole());
        return publicationData;
    }
}
