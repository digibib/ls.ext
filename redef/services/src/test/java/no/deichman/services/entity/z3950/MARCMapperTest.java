package no.deichman.services.entity.z3950;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import no.deichman.services.utils.ResourceReader;
import org.junit.Test;

import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

/**
 * Responsibility: test that marc is mapped as expected.
 */
public class MARCMapperTest extends MappingTester {

    @Test
    public void it_has_constructor() {
        assertNotNull(new MARCMapper());
    }

    @Test
    public void it_can_map_marc() {
        String marc = new ResourceReader().readFile("BS_external_data.xml");
        List<Object> mapping = new MARCMapper().getMapping(marc);
        assertNotNull(mapping);
    }

    @Test
    public void it_maps_marc_with_work() {
        String marc = new ResourceReader().readFile("BS_external_data_with_work.xml");
        List<Object> mapping = new MARCMapper().getMapping(marc);
        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        assertEquals(simplifyBNodes(new ResourceReader().readFile("BS_external_with_work_raw_mapping.json")), simplifyBNodes(gson.toJson(mapping)));
    }
}
