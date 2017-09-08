package no.deichman.services.ontology;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import no.deichman.services.rdf.RDFModelUtil;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.ResIterator;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.riot.Lang;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;

import javax.ws.rs.core.MultivaluedHashMap;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;
import java.lang.reflect.Type;
import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.google.common.collect.Lists.newArrayList;
import static java.util.stream.Collectors.toList;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.mockito.Mockito.when;

public class TemplateResourceTest {
    private TemplateResource templateResource;

    @Before
    public void setUp() throws Exception {
        templateResource = new TemplateResource();
    }

    @Test
    public void should_have_default_constructor() {
        assertNotNull(new TemplateResource());
    }
    
    @Test
    public void should_find_template_for_musical_recording() {
        templateResource = new TemplateResource();
        final UriInfo uriInfo = Mockito.mock(UriInfo.class);
        final MultivaluedHashMap<String, String> parameters = new MultivaluedHashMap<>();
        parameters.put("http://data.deichman.no/ontology#hasMediaType", newArrayList("http://data.deichman.no/mediaType#MusicRecording"));
        when(uriInfo.getQueryParameters()).thenReturn(parameters);
        final URI uri = URI.create("http://data.deichman.no/publication/template?http%3A%2F%2Fdata.deichman.no%2Fontology%23hasMediaType=http%3A%2F%2Fdata.deichman.no%2FmediaType%23MusicRecording");
        when(uriInfo.getRequestUri()).thenReturn(uri);
        final Response response = templateResource.getTemplateForResourceType("publication", uriInfo);
        Type hashMapType = new TypeToken<HashMap<String, Object>>(){}.getType();
        final String modelAsJsonLd = response.getEntity().toString();
        final Map<String, String> fromJson = new Gson().fromJson(modelAsJsonLd, hashMapType);
        assertNotNull(fromJson);
        final Model model = RDFModelUtil.modelFrom(modelAsJsonLd, Lang.JSONLD);
        final ResIterator nodeIterator = model.listSubjects();
        final List<Resource> urisInModel = nodeIterator.toList().stream().filter(RDFNode::isURIResource).collect(toList());
        assertEquals(urisInModel.size(), 1);
        assertEquals(
                "http://data.deichman.no/publication/template?http%3A%2F%2Fdata.deichman.no%2Fontology%23hasMediaType=http%3A%2F%2Fdata.deichman.no%2FmediaType%23MusicRecording",
                urisInModel.get(0).getURI()
        );

    }
}
