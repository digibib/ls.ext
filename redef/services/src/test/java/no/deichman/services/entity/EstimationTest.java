package no.deichman.services.entity;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import org.junit.Test;

import static org.junit.Assert.assertEquals;


/**
 * Responsibility: test Estimation class.
 */
public class EstimationTest {

    @Test
    public void test_estimation() {
        String estimationObject = "{\"estimate\": \"1\", \"error\": \"\", \"pending\": false}";
        Gson gson = new GsonBuilder().setPrettyPrinting().serializeNulls().excludeFieldsWithoutExposeAnnotation().create();
        Estimation estimation = gson.fromJson(estimationObject, Estimation.class);
        assertEquals(1, estimation.getEstimatedWait());
        assertEquals("", estimation.getError());
        assertEquals(false, estimation.isPending());
    }
}
