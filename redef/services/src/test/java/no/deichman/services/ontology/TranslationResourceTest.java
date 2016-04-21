package no.deichman.services.ontology;


import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import org.junit.Before;
import org.junit.Test;

import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.Map;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertThat;

public class TranslationResourceTest {

    private TranslationResource translationResource;

    @Before
    public void setUp() throws Exception {
        translationResource = new TranslationResource();
    }

    @Test
    public void should_have_default_constructor() {
        assertNotNull(new TranslationResource());
    }

    @Test
    public void should_return_ok_when_getting_english_and_norwegian() {
        Response response1 = translationResource.getTranslations("en");
        assertThat(response1.getStatus(), equalTo(Status.OK.getStatusCode()));
        Response response2 = translationResource.getTranslations("no");
        assertThat(response2.getStatus(), equalTo(Status.OK.getStatusCode()));
    }

    @Test
    public void should_actually_return_some_translations_for_format_language_audience() {
        Response response = translationResource.getTranslations("no");
        Type hashMapType = new TypeToken<HashMap<String, String>>(){}.getType();
        Map<String, String> translations = new Gson().fromJson(response.getEntity().toString(), hashMapType);
        assertThat(translations.get("http://data.deichman.no/format#DVD"), equalTo("DVD"));
        assertThat(translations.get("http://lexvo.org/id/iso639-3/nob"), equalTo("Norsk (bokmål)"));
        assertThat(translations.get("http://data.deichman.no/audience#juvenile"), equalTo("Barn og ungdom"));
        assertThat(translations.get("http://data.deichman.no/role#performer"), equalTo("Utøver"));
    }
}
