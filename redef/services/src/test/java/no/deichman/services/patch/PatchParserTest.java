package no.deichman.services.patch;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.junit.Test;

import no.deichman.services.error.PatchParserException;

public class PatchParserTest {
    @Test
    public void it_exists(){
        assertNotNull(new PatchParser());
    }
    
    @Test
    public void it_sets_gets_input_data(){
        PatchParser pp = new PatchParser();
        String input = "{\"one\":\"one\"}";
        pp.setPatchData(input);
        assertEquals(input,pp.getPatchInput());
    }
    
    @Test
    public void it_returns_list_of_patch_objects() throws PatchParserException{
        List<PatchObject> lpo = new ArrayList<PatchObject>();
        PatchObject po = new PatchObject();
        po.setOperation("add");
        po.setSubject("http://example.com/s");
        po.setPredicate("http://example.com/a");
        po.setObjectValue("Housec");
        lpo.add(po);
        String input = "{\"op\":\"add\",\"s\":\"http://example.com/s\",\"p\":\"http://example.com/a\",\"o\":{\"value\":\"Housec\"}}";
        PatchParser pp = new PatchParser(input);
        pp.parsePatch();
        List<PatchObject> list = pp.getRawPatchObject();
        assertEquals(list.get(0).getObjectValue(),po.getObjectValue());
        assertEquals(list.get(0).getSubject(),po.getSubject());
        assertEquals(list.get(0).getPredicate(),po.getPredicate());
        assertEquals(list.get(0).getObject(),po.getObject());
    }

}
