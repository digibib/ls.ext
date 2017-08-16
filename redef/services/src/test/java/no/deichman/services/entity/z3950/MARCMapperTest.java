package no.deichman.services.entity.z3950;

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
    @Test
    public void test_get_mapping() throws Exception {
        String ragde = new ResourceReader().readFile("ragde.marcxml");
        MARCMapper marcMapper = new MARCMapper();
        String result = new GsonBuilder()
                .setPrettyPrinting()
                .create()
                .toJson(marcMapper.getMapping(ragde))
                .replaceAll("_:[^\"]+", "_:DOES_NOT_MATTER");

        String expected = "[\n"
                + "  {\n"
                + "    \"@graph\": [\n"
                + "      {\n"
                + "        \"deichman:audience\": [\n"
                + "          {\n"
                + "            \"@id\": \"http://data.deichman.no/audience#adult\"\n"
                + "          }\n"
                + "        ],\n"
                + "        \"deichman:fictionNonfiction\": {\n"
                + "          \"@id\": \"http://data.deichman.no/fictionNonfiction#fiction\"\n"
                + "        },\n"
                + "        \"deichman:contributor\": [\n"
                + "          {\n"
                + "            \"@id\": \"_:DOES_NOT_MATTER\"\n"
                + "          }\n"
                + "        ],\n"
                + "        \"deichman:mainTitle\": \"Berlinerpoplene\",\n"
                + "        \"@type\": [\n"
                + "          \"deichman:Work\",\n"
                + "          \"deichman:TopBanana\"\n"
                + "        ],\n"
                + "        \"@id\": \"_:DOES_NOT_MATTER\"\n"
                + "      },\n"
                + "      {\n"
                + "        \"deichman:hasPlaceOfPublication\": {\n"
                + "          \"@id\": \"_:DOES_NOT_MATTER\"\n"
                + "        },\n"
                + "        \"deichman:publishedBy\": {\n"
                + "          \"@id\": \"_:DOES_NOT_MATTER\"\n"
                + "        },\n"
                + "        \"deichman:publicationOf\": {\n"
                + "          \"@id\": \"_:DOES_NOT_MATTER\"\n"
                + "        },\n"
                + "        \"deichman:publicationYear\": \"2004\",\n"
                + "        \"deichman:mainTitle\": \"Berlinerpoplene\",\n"
                + "        \"deichman:language\": [\n"
                + "          {\n"
                + "            \"@id\": \"http://lexvo.org/id/iso639-3/nob\"\n"
                + "          }\n"
                + "        ],\n"
                + "        \"@type\": [\n"
                + "          \"deichman:Publication\"\n"
                + "        ],\n"
                + "        \"@id\": \"_:DOES_NOT_MATTER\"\n"
                + "      },\n"
                + "      {\n"
                + "        \"@type\": [\n"
                + "          \"deichman:Place\"\n"
                + "        ],\n"
                + "        \"@id\": \"_:DOES_NOT_MATTER\",\n"
                + "        \"deichman:prefLabel\": \"Oslo\"\n"
                + "      },\n"
                + "      {\n"
                + "        \"deichman:name\": \"Oktober\",\n"
                + "        \"@type\": [\n"
                + "          \"deichman:Corporation\"\n"
                + "        ],\n"
                + "        \"@id\": \"_:DOES_NOT_MATTER\"\n"
                + "      },\n"
                + "      {\n"
                + "        \"deichman:name\": \"Ragde, Anne B.\",\n"
                + "        \"@type\": [\n"
                + "          \"deichman:Person\"\n"
                + "        ],\n"
                + "        \"@id\": \"_:DOES_NOT_MATTER\"\n"
                + "      },\n"
                + "      {\n"
                + "        \"deichman:agent\": {\n"
                + "          \"@id\": \"_:DOES_NOT_MATTER\"\n"
                + "        },\n"
                + "        \"deichman:role\": {\n"
                + "          \"@id\": \"http://data.deichman.no/role#author\"\n"
                + "        },\n"
                + "        \"@type\": [\n"
                + "          \"deichman:Contribution\",\n"
                + "          \"deichman:MainEntry\"\n"
                + "        ],\n"
                + "        \"@id\": \"_:DOES_NOT_MATTER\"\n"
                + "      }\n"
                + "    ],\n"
                + "    \"@context\": {\n"
                + "      \"deichman\": \"http://deichman.no/ontology#\",\n"
                + "      \"rdfs\": \"http://www.w3.org/1999/02/22-rdf-syntax-ns#\",\n"
                + "      \"duo\": \"http://deichman.no/utility#\"\n"
                + "    }\n"
                + "  }\n"
                + "]";

        assertEquals(expected, result);
    }

    @BeforeClass
    public static void setupJena() {
        JenaSystem.init(); // Needed to counter sporadic nullpointerexceptions because of context is not initialized.
    }

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
        checkMapping("BS_external_data_with_work.xml", "BS_external_with_work_raw_mapping.json");
    }

    @Test
    public void it_maps_marc_with_extent() {
        checkMapping("BS_external_data_with_extent.xml", "BS_external_with_extent.json");
    }

    @Test
    public void it_maps_bible() {
        checkMapping("BS_external_data_bible.xml", "BS_external_data_bible.json");
    }

    private void checkMapping(String marcXmlFile, String jsonFile) {
        String marc = new ResourceReader().readFile(marcXmlFile);
        List<Object> mapping = new MARCMapper(true).getMapping(marc);
        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        assertEquals(simplifyBNodes(new ResourceReader().readFile(jsonFile)), simplifyBNodes(gson.toJson(mapping)));
        assertThat(simplifyBNodes(new ResourceReader().readFile(jsonFile)),
                SameJSONAs.sameJSONAs(simplifyBNodes(gson.toJson(mapping)))
                        .allowingExtraUnexpectedFields()
                        .allowingAnyArrayOrdering());
    }
}
