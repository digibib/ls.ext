package no.deichman.services.version;


import com.google.gson.Gson;
import org.junit.Test;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

public class VersionResourceTest {
    private VersionResource versionResource = new VersionResource();

    @Test
    public void should_have_default_constructor() {
        assertNotNull(new VersionResource());
    }

    @Test
    public void should_return_gitref_and_jenkinsid_equal_to_environment_variables_set() throws IOException {
        Gson gson = new Gson();
        Map<String, String> response = gson.fromJson(versionResource.getVersion().getEntity().toString(), HashMap.class);
        assertEquals(Optional.ofNullable(System.getenv("GITREF")).orElse(""), response.get("gitref"));
        assertEquals(Optional.ofNullable(System.getenv("JENKINSID")).orElse(""), response.get("jenkinsId"));
    }
}
