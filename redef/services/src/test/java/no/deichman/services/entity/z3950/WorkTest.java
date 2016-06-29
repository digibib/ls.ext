package no.deichman.services.entity.z3950;

import com.google.gson.Gson;
import org.junit.Test;

import static org.junit.Assert.assertNotNull;

/**
 * Responsibility: Test work class.
 */
public class WorkTest {
    @Test
    public void has_default_constructor() {
        assertNotNull(new Work());
    }

    @Test
    public void has_overloaded_constructor() {
        String contribution = "_:0000123123125";
        assertNotNull(new Work("_:123123", "title", contribution));
    }

    @Test
    public void can_create_work_mapping() {
        String id = "_:213123";
        String title = "All the stories of funk music";
        String contribution = "_:999123123";

        Work work = new Work(id, title, contribution);

        assertNotNull(work.getMap());

        System.out.print(new Gson().toJson(work.getMap()));

    }
}
