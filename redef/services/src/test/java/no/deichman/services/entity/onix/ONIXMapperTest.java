package no.deichman.services.entity.onix;

import com.tectonica.jonix.onix3.Product;
import no.deichman.services.entity.onix.ONIXMapper;
import no.deichman.services.entity.onix.OnixResourceAdapter;
import no.deichman.services.entity.onix.TopLevelMappingObject;
import no.deichman.services.utils.ResourceReader;
import org.junit.Test;

import static org.junit.Assert.assertEquals;

/**
 * Responsibility: test ONIX mapper.
 */
public class ONIXMapperTest {
    @Test
    public void getMapping() throws Exception {
        Product product = new OnixResourceAdapter()
                .extractOnix(new ResourceReader().readFile("onix_de_velvillige.xml"))
                .get(0);
        ONIXMapper onixMapper = new ONIXMapper();
        TopLevelMappingObject mapping = onixMapper.getMapping(product);
        assertEquals("De velvillige", mapping.getWork().getMainTitle());
    }
}
