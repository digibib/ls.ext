package no.deichman.services.entity.external;

import org.junit.Test;

import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

/**
 * Responsibility: test basic bibliographic object.
 */
public class BibliographicObjectTest {

    @Test
    public void has_default_constructor() {
        assertNotNull(new BibliographicObjectExternal());
    }

    @Test
    public void has_overloaded_constructor() {

        String title = "An exciting title";
        String subtitle = "An exciting subtitle";
        String contributor = "_:000000128127";
        BibliographicObjectExternal boe = new BibliographicObjectExternal(title, subtitle);

        assertNotNull(boe);
        assertEquals(title, boe.getMainTitle());
        assertEquals(subtitle, boe.getSubtitle());
    }

    @Test
    public void can_build_bibliographic_object() {
        String title = "Jolity";
        String subTitle = "A novel";
        BibliographicObjectExternal bibliographicObjectExternal = new BibliographicObjectExternal();
        bibliographicObjectExternal.setMainTitle(title);
        bibliographicObjectExternal.setSubtitle(subTitle);
        assertEquals(title, bibliographicObjectExternal.getMainTitle());
        assertEquals(subTitle, bibliographicObjectExternal.getSubtitle());
    }

    @Test
    public void can_create_mapping() {
        String title = "An exciting title";
        String subtitle = "An equally exciting subtitle";
        String contribution = "_:09990005959";
        BibliographicObjectExternal bibliographicObject = new BibliographicObjectExternal(title, subtitle);
        Map<String, Object> map2 = bibliographicObject.getMap();
        assertTrue(map2.containsValue(title));
        assertTrue(map2.containsValue(subtitle));
    }
}
