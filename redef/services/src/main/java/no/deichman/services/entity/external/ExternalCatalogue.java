package no.deichman.services.entity.external;

import java.io.IOException;

/**
 *  Responsibility: common interface for external cataloguing services.
 */
public interface ExternalCatalogue {
    SearchResultInfo getByField(String targetString, String term, String parameter) throws IOException;
}
