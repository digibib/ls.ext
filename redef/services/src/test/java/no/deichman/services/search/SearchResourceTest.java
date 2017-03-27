package no.deichman.services.search;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

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
    private Response mockPlaceSearchResponse;

    @Mock
    private Response mockCorporationSearchResponse;

    @Mock
    private Response mockSerialSearchResponse;

    @Mock
    private Response mockWorkSeriesSearchResponse;

    @Before
    public void setUp() throws Exception {
        searchResource = new SearchResource(mockSearchService);
        searchResource.getConfig();
        when(mockSearchService.searchWork(anyString())).thenReturn(mockWorkSearchResponse);
        when(mockSearchService.searchPerson(anyString())).thenReturn(mockPersonSearchResponse);
        when(mockSearchService.searchPlace(anyString())).thenReturn(mockPlaceSearchResponse);
        when(mockSearchService.searchCorporation(anyString())).thenReturn(mockCorporationSearchResponse);
        when(mockSearchService.searchSerial(anyString())).thenReturn(mockSerialSearchResponse);
        when(mockSearchService.searchWorkSeries(anyString())).thenReturn(mockWorkSeriesSearchResponse);
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
    public void when_search_for_place_returns_place_response() throws Exception {
        Assert.assertSame(mockPlaceSearchResponse, searchResource.search("place", "query"));
    }

    @Test
    public void when_search_for_corporation_returns_publisher_response() throws Exception {
        Assert.assertSame(mockCorporationSearchResponse, searchResource.search("corporation", "query"));
    }

    @Test
    public void when_search_for_serial_returns_serial_response() throws Exception {
        Assert.assertSame(mockSerialSearchResponse, searchResource.search("serial", "query"));
    }

    @Test
    public void when_search_for_workSeries_returns_work_eries_response() throws Exception {
        Assert.assertSame(mockWorkSeriesSearchResponse, searchResource.search("workSeries", "query"));
    }

    @Test
    public void when_search_with_empty_query_bad_request_is_returned() {
        assertEquals(SC_BAD_REQUEST, searchResource.search("person", "").getStatus());
        assertEquals(SC_BAD_REQUEST, searchResource.search("work", "").getStatus());
    }

    @Test(expected = RuntimeException.class)
    public void when_search_for_unknown_type_throws_exceptiom() {
        searchResource.search("unknown", "a").getStatus();
    }
}
