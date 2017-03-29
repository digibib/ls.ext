package no.deichman.services.circulation;

import java.util.Map;

/**
 * Responsibility: provide interface for generic methods on circulation objects.
 */
public interface CirculationObject {

    void setRecordId(String recordId);

    String getRecordId();

    void setWorkURI(String workURI);

    void setPublicationURI(String publicationUri);

    void setPublicationImage(String publicationImage);

    void setContributor(Map<String, String> contributor);

    void setMediaType(String mediaType);

    String getWorkURI();

    String getPublicationURI();

    void setRelativePublicationPath(String relativePublicationPath);

    void setTitle(String title);

    void setPublicationYear(String publicationYear);

    String getStatus();

    void setBranchCode(String branchCode);

    void setId(String id);

    void decorateWithPublicationData(Map<String, String> publicationData) throws Exception;
}
