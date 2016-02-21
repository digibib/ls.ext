package no.deichman.services.search;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import javax.ws.rs.core.Response;

import static javax.servlet.http.HttpServletResponse.SC_BAD_REQUEST;
import static org.junit.Assert.assertEquals;
import static org.mockito.Matchers.anyString;
import static org.mockito.Mockito.when;

/**
 * Responsibility: unit test SearchResource.
 */
@RunWith(MockitoJUnitRunner.class)
public class SearchResourceTest {

    private SearchResource searchResource;

    @Mock
    private SearchService mockSearchService;

    @Mock
    private Response mockWorkSearchResponse;

    @Mock
    private Response mockPersonSearchResponse;

    @Mock
    private Response mockPlaceOfPublicationSearchResponse;

    @Mock
    private Response mockPublisherSearchResponse;

    @Before
    public void setUp() throws Exception {
        searchResource = new SearchResource(mockSearchService);
        searchResource.getConfig();
        when(mockSearchService.searchWork(anyString())).thenReturn(mockWorkSearchResponse);
        when(mockSearchService.searchPerson(anyString())).thenReturn(mockPersonSearchResponse);
        when(mockSearchService.searchPlaceOfPublication(anyString())).thenReturn(mockPlaceOfPublicationSearchResponse);
        when(mockSearchService.searchPublisher(anyString())).thenReturn(mockPublisherSearchResponse);
    }

    @Test
    public void when_search_for_works_returns_work_search_response() throws Exception {
        Assert.assertSame(mockWorkSearchResponse, searchResource.search("work", "query"));
    }

    @Test
    public void when_search_for_person_returns_person_search_response() throws Exception {
        Assert.assertSame(mockPersonSearchResponse, searchResource.search("person", "query"));
    }

    @Test
    public void when_search_for_place_of_publication_returns_place_of_publication_response() throws Exception {
        Assert.assertSame(mockPlaceOfPublicationSearchResponse, searchResource.search("placeOfPublication", "query"));
    }

    @Test
    public void when_search_for_publisher_returns_publisher_response() throws Exception {
        Assert.assertSame(mockPublisherSearchResponse, searchResource.search("publisher", "query"));
    }

    @Test
    public void when_search_with_empty_query_bad_request_is_returned() {
        assertEquals(SC_BAD_REQUEST , searchResource.search("person", "").getStatus());
        assertEquals(SC_BAD_REQUEST, searchResource.search("work", "").getStatus());
    }

    @Test(expected = RuntimeException.class)
    public void when_search_for_unknown_type_throws_exceptiom() {
        searchResource.search("unknown", "a").getStatus();
    }
}
