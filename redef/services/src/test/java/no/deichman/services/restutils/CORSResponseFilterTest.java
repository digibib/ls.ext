package no.deichman.services.restutils;

import java.io.IOException;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerResponseContext;
import javax.ws.rs.container.ContainerResponseFilter;
import javax.ws.rs.core.MultivaluedHashMap;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;
import static no.deichman.services.restutils.CORSResponseFilter.AC_ALLOW_HEADERS;
import static no.deichman.services.restutils.CORSResponseFilter.AC_ALLOW_METHODS;
import static no.deichman.services.restutils.CORSResponseFilter.AC_ALLOW_ORIGIN;
import static no.deichman.services.restutils.CORSResponseFilter.AC_EXPOSE_HEADERS;
import static no.deichman.services.restutils.CORSResponseFilter.AC_REQUEST_HEADERS;
import static no.deichman.services.restutils.CORSResponseFilter.AC_REQUEST_METHOD;
import static no.deichman.services.restutils.CORSResponseFilter.ALLOW_HEADER;
import static no.deichman.services.restutils.CORSResponseFilter.LOCATION_HEADER_KEY;
import static no.deichman.services.restutils.CORSResponseFilter.ORIGIN_HEADER_KEY;
import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.hasItem;
import static org.hamcrest.CoreMatchers.instanceOf;
import static org.hamcrest.CoreMatchers.not;
import static org.hamcrest.Matchers.contains;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertThat;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class CORSResponseFilterTest {

    private static final String OPTIONS_METHOD = "OPTIONS";
    private static final String THE_METHOD = "PATCH";
    private static final String THE_LIST_OF_ALLOWED_METHODS = "GET, PUT, ... (A LIST OF METHODS)";
    private static final String SOME_LOCATION = "http://example.com/some/location";
    private static final String SOME_ORIGIN = "http://deichman.example.com:8080";
    private static final String POST_METHOD ="POST";
    private static final boolean NO_ORIGIN_HEADER = false;

    @Mock
    private ContainerResponseContext mockRespCtx;

    @Mock
    private ContainerRequestContext mockReqCtx;

    private final MultivaluedHashMap<String, String> fakeReqHeaderMap = new MultivaluedHashMap<>();
    private final MultivaluedMap<String, Object> fakeRespHeaderMap = new MultivaluedHashMap<>();

    @Mock
    private MultivaluedHashMap<String,String> mockRequestHeadersWithoutOrigin;

    private CORSResponseFilter filter;

    @Before
    public void setUp() {
        when(mockReqCtx.getHeaders()).thenReturn(fakeReqHeaderMap);
        fakeReqHeaderMap.putSingle(ORIGIN_HEADER_KEY, SOME_ORIGIN); // CORS-request needs Origin:-header

        when(mockRespCtx.getHeaders()).thenReturn(fakeRespHeaderMap);

        filter = new CORSResponseFilter();
    }

    @Test
    public void should_have_default_constructor() {
        assertNotNull(new CORSResponseFilter());
    }

    @Test
    public void should_be_a_ContainerResponseFilter() {
        assertThat(filter, instanceOf(ContainerResponseFilter.class));
    }

    @Test
    public void should_not_add_headers_to_non_CORS_requests() throws IOException {
        // Setup for non-CORS-request
        when(mockRequestHeadersWithoutOrigin.containsKey(ORIGIN_HEADER_KEY)).thenReturn(NO_ORIGIN_HEADER);

        final ContainerRequestContext nonCORSRequestCtx = mock(ContainerRequestContext.class);
        when(nonCORSRequestCtx.getHeaders()).thenReturn(mockRequestHeadersWithoutOrigin);

        final ContainerResponseContext mockRespCtxWhichShouldBeUntouched = mock(ContainerResponseContext.class);

        new CORSResponseFilter().filter(nonCORSRequestCtx, mockRespCtxWhichShouldBeUntouched);

        verifyNoMoreInteractions(mockRespCtxWhichShouldBeUntouched);
    }

    @Test
    public void should_always_add_allow_origin_header_to_CORS_requests() throws Exception {
        filter.filter(mockReqCtx, mockRespCtx);
        assertThat(mockRespCtx.getHeaders().keySet(), hasItem(AC_ALLOW_ORIGIN));
    }

    @Test
    public void should_always_accept_all_origins() throws IOException {
        filter.filter(mockReqCtx, mockRespCtx);
        assertThat(mockRespCtx.getHeaders().getFirst(AC_ALLOW_ORIGIN), equalTo("*"));
    }

    @Test
    public void on_non_preflight_options_request_should_not_include_allow_headers() throws IOException {
        when(mockReqCtx.getMethod()).thenReturn(OPTIONS_METHOD);
        filter.filter(mockReqCtx, mockRespCtx);
        assertThat(mockRespCtx.getHeaders().keySet(), not(contains(AC_ALLOW_METHODS, AC_ALLOW_ORIGIN)));
    }

    @Test
    public void on_preflight_request_should_include_allow_methods() throws IOException {
        when(mockReqCtx.getMethod()).thenReturn(OPTIONS_METHOD);
        fakeReqHeaderMap.putSingle(AC_REQUEST_METHOD, THE_METHOD);
        fakeReqHeaderMap.putSingle(AC_REQUEST_HEADERS, "accept-encoding");

        fakeRespHeaderMap.putSingle(ALLOW_HEADER, THE_LIST_OF_ALLOWED_METHODS);

        filter.filter(mockReqCtx, mockRespCtx);

        assertThat(mockRespCtx.getHeaders().keySet(), hasItem(AC_ALLOW_METHODS));
        assertThat(mockRespCtx.getHeaders().keySet(), hasItem(AC_ALLOW_HEADERS));
    }

    @Test @Ignore("we don't really know what to expose")
    public void on_actual_request_should_include_expose_headers() throws IOException {
        when(mockReqCtx.getMethod()).thenReturn(POST_METHOD);
        filter.filter(mockReqCtx, mockRespCtx);
        assertThat(mockRespCtx.getHeaders().getFirst(AC_EXPOSE_HEADERS), equalTo("something"));
    }

    @Test
    public void should_expose_location_header_when_status_is_CREATED() throws IOException {
        when(mockRespCtx.getStatusInfo()).thenReturn(Response.Status.CREATED);
        fakeRespHeaderMap.putSingle(CORSResponseFilter.LOCATION_HEADER_KEY, SOME_LOCATION);

        filter.filter(mockReqCtx, mockRespCtx);

        assertThat(mockRespCtx.getHeaders().getFirst(AC_EXPOSE_HEADERS), equalTo(LOCATION_HEADER_KEY));
    }

}
