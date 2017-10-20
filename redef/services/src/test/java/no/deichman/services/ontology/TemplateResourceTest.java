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
import java.io.UnsupportedEncodingException;
import java.lang.reflect.Type;
import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.google.common.collect.Lists.newArrayList;
import static java.net.URLEncoder.encode;
import static java.util.stream.Collectors.toList;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.mockito.Mockito.when;

public class TemplateResourceTest {

    private static final String PUBLICATION = "publication";
    private static final String WORK = "work";
    private static final String MEDIA_TYPE = "http://data.deichman.no/ontology#hasMediaType";
    private static final String WORK_TYPE = "http://data.deichman.no/ontology#hasWorkType";
    private static final String BOOK = "http://data.deichman.no/mediaType#Book";
    private static final String E_BOOK = "http://data.deichman.no/mediaType#E-Book";
    private static final String AUDIO_BOOK = "http://data.deichman.no/mediaType#Audiobook";
    private static final String COMIC_BOOK = "http://data.deichman.no/mediaType#ComicBook";
    private static final String LANGUAGE_COURSE = "http://data.deichman.no/mediaType#LanguageCourse";
    private static final String FILM = "http://data.deichman.no/mediaType#Film";
    private static final String MUSIC_RECORDING = "http://data.deichman.no/mediaType#MusicRecording";
    private static final String SHEET_MUSIC = "http://data.deichman.no/mediaType#SheetMusic";
    private static final String GAME = "http://data.deichman.no/mediaType#Game";
    private static final String OTHER = "http://data.deichman.no/mediaType#Other";
    private static final String PERIODICAL = "http://data.deichman.no/mediaType#Periodical";
    private static final String MUSIC = "http://data.deichman.no/workType#Music";
    private static final String TELEPATHIC_TRANSFER = "http://data.deichman.no/mediaType#TelepathicTransfer";

    private TemplateResource templateResource;

    @Before
    public void setUp() throws Exception {
        templateResource = new TemplateResource();
    }

    @Test
    public void should_have_default_constructor() {
        new TemplateResource();
    }


    @Test
    public void should_get_204_for_unknown_template() throws Exception {
        templateResource = new TemplateResource();
        final UriInfo uriInfo = createMockUriInfo(PUBLICATION, MEDIA_TYPE, TELEPATHIC_TRANSFER);
        final Response response = templateResource.getTemplateForResourceType(PUBLICATION, uriInfo);
        assertEquals(204, response.getStatus());
    }

    @Test
    public void should_get_204_when_no_parameters() throws Exception {
        templateResource = new TemplateResource();
        final UriInfo uriInfo = createEmptyMockUriInfo(WORK);
        final Response response = templateResource.getTemplateForResourceType(WORK, uriInfo);
        assertEquals(204, response.getStatus());
    }

    @Test
    public void should_find_template_for_musical_recording() throws Exception {
        templateResource = new TemplateResource();
        checkTemplateExistsForResource(PUBLICATION, MEDIA_TYPE, MUSIC_RECORDING);
    }

    @Test
    public void should_find_template_for_musical_work() throws Exception {
        templateResource = new TemplateResource();
        checkTemplateExistsForResource(WORK, WORK_TYPE, MUSIC);
    }

    @Test
    public void should_find_template_for_work_based_on_media_type() throws Exception {
        templateResource = new TemplateResource();
        checkTemplateExistsForResource(WORK, MEDIA_TYPE, BOOK);
        checkTemplateExistsForResource(WORK, MEDIA_TYPE, E_BOOK);
        checkTemplateExistsForResource(WORK, MEDIA_TYPE, AUDIO_BOOK);
        checkTemplateExistsForResource(WORK, MEDIA_TYPE, COMIC_BOOK);
        checkTemplateExistsForResource(WORK, MEDIA_TYPE, LANGUAGE_COURSE);
        checkTemplateExistsForResource(WORK, MEDIA_TYPE, FILM);
        checkTemplateExistsForResource(WORK, MEDIA_TYPE, MUSIC_RECORDING);
        checkTemplateExistsForResource(WORK, MEDIA_TYPE, SHEET_MUSIC);
        checkTemplateExistsForResource(WORK, MEDIA_TYPE, GAME);
        checkTemplateExistsForResource(WORK, MEDIA_TYPE, OTHER);
        checkTemplateExistsForResource(WORK, MEDIA_TYPE, PERIODICAL);
    }

    private void checkTemplateExistsForResource(String resourceType, String templateParameter, String parameterValue) throws UnsupportedEncodingException {
        final UriInfo uriInfo = createMockUriInfo(resourceType, templateParameter, parameterValue);
        final Response response = templateResource.getTemplateForResourceType(resourceType, uriInfo);
        Type hashMapType = new TypeToken<HashMap<String, Object>>() {
        }.getType();
        final String modelAsJsonLd = response.getEntity().toString();
        final Map<String, String> fromJson = new Gson().fromJson(modelAsJsonLd, hashMapType);
        assertNotNull(fromJson);
        final Model model = RDFModelUtil.modelFrom(modelAsJsonLd, Lang.JSONLD);
        final ResIterator nodeIterator = model.listSubjects();
        final List<Resource> urisInModel = nodeIterator.toList().stream().filter(RDFNode::isURIResource).collect(toList());
        assertEquals(urisInModel.size(), 1);
        assertEquals(
                createUrlWithOneParameter(resourceType, templateParameter, parameterValue),
                urisInModel.get(0).getURI()
        );
    }

    private String createUrlWithOneParameter(String resourceType, String parameter, String paramValue) throws UnsupportedEncodingException {
        return String.format("http://data.deichman.no/%s/template?%s=%s", resourceType, encode(parameter, "UTF-8"), encode(paramValue, "UTF-8"));
    }

    private UriInfo createMockUriInfo(String resourceType, String parameterName, String paramValue) throws UnsupportedEncodingException {
        final UriInfo uriInfo = Mockito.mock(UriInfo.class);
        final MultivaluedHashMap<String, String> parameters = new MultivaluedHashMap<>();
        parameters.put(parameterName, newArrayList(paramValue));
        when(uriInfo.getQueryParameters()).thenReturn(parameters);
        final URI uri = URI.create(createUrlWithOneParameter(resourceType, parameterName, paramValue));
        when(uriInfo.getRequestUri()).thenReturn(uri);
        return uriInfo;
    }

    private UriInfo createEmptyMockUriInfo(String resourceType) throws UnsupportedEncodingException {
        final UriInfo uriInfo = Mockito.mock(UriInfo.class);
        when(uriInfo.getQueryParameters()).thenReturn(new MultivaluedHashMap<>());
        final URI uri = URI.create(String.format("http://data.deichman.no/%s/template", resourceType));
        when(uriInfo.getRequestUri()).thenReturn(uri);
        return uriInfo;
    }
}
