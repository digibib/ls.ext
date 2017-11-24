package no.deichman.services.entity.external;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import no.deichman.services.utils.ResourceReader;
import org.apache.jena.system.JenaSystem;
import org.junit.BeforeClass;
import org.junit.Test;
import uk.co.datumedge.hamcrest.json.SameJSONAs;

import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertThat;

/**
 * Responsibility: test that marc is mapped as expected.
 */
public class MARCMapperTest extends MappingTester {
    @BeforeClass
    public static void setupJena() {
        JenaSystem.init(); // Needed to counter sporadic nullpointerexceptions because of context is not initialized.
    }

    @Test
    public void it_can_map_marc() {
        String marc = new ResourceReader().readFile("BS_external_data.xml");
        List<Object> mapping = new BSMarcMapper("Book", Target.BIBBI).getMapping(marc);
        assertNotNull(mapping);
        checkMapping("Book","BS_external_data.xml", "BS_external_data.json");
    }

    @Test
    public void it_maps_marc_with_work() {
        checkMapping("Book","BS_external_data_with_work.xml", "BS_external_with_work_raw_mapping.json");
    }

    @Test
    public void it_maps_marc_with_extent() {
        checkMapping("Film","BS_external_data_with_extent.xml", "BS_external_with_extent.json");
    }

    @Test
    public void it_maps_bible() {
        checkMapping("Book","BS_external_data_bible.xml", "BS_external_data_bible.json");
    }

    private void checkMapping(String mediaType, String marcXmlFile, String jsonFile) {
        String marc = new ResourceReader().readFile(marcXmlFile);
        List<Object> mapping = new BSMarcMapper(mediaType, Target.BIBBI, true).getMapping(marc);
        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        assertEquals(simplifyBNodes(new ResourceReader().readFile(jsonFile)), simplifyBNodes(gson.toJson(mapping)));
        assertThat(simplifyBNodes(new ResourceReader().readFile(jsonFile)),
                SameJSONAs.sameJSONAs(simplifyBNodes(gson.toJson(mapping)))
                        .allowingExtraUnexpectedFields()
                        .allowingAnyArrayOrdering());
    }
}
