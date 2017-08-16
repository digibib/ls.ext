package no.deichman.services.entity.onix;

import com.tectonica.jonix.onix3.Product;
import com.tectonica.jonix.onix3.TitleDetail;
import no.deichman.services.entity.onix.TopLevelMappingObject;
import no.deichman.services.entity.z3950.Publication;
import no.deichman.services.entity.z3950.Work;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Responsibility: Map ONIX to JSON-RDF.
 */
public final class ONIXMapper {
    ONIXMapper() {
    }

    TopLevelMappingObject getMapping(Product product) {
        TopLevelMappingObject topLevelMap = new TopLevelMappingObject();
        Work work = new Work();
        Publication publication = new Publication();
        List<String> titles = new ArrayList<>();

        for (TitleDetail titleDetail : product.descriptiveDetail.titleDetails) {
            Map<String, String> workAndPublicationTitleCandidates = new HashMap<>();

            if (titleDetail.getTitleTypeValue().code.equals("01")) {
                titleDetail.titleElements.forEach(titleElement -> {
                    workAndPublicationTitleCandidates.put(titleElement.titleElementLevel.value.getCode(), titleElement.getTitleTextValue());
                });
            }


            switch (workAndPublicationTitleCandidates.size()) {
                case 1:
                    String title = workAndPublicationTitleCandidates.get("01");
                    work.setMainTitle(title);
                    break;
                default:
                    processTitles(workAndPublicationTitleCandidates, work);
                    break;
            }
        }
        topLevelMap.setWork(work);
        return topLevelMap;
    }

    private void processTitles(Map<String, String> workAndPublicationTitleCandidates, Work work) {
        boolean translated = isTranslation(workAndPublicationTitleCandidates);
        workAndPublicationTitleCandidates.forEach((key, value) -> {
            if (key == "01" && translated) {
                work.setMainTitle(value);
            }
        });
    }

    private boolean isTranslation(Map<String, String> workAndPublicationTitleCandidates) {
        boolean returnValue = false;
        if (workAndPublicationTitleCandidates.containsKey("03")) {
            returnValue = true;
        }
        return returnValue;
    }
}
