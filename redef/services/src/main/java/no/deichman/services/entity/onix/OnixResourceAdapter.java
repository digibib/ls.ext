package no.deichman.services.entity.onix;

import com.tectonica.jonix.Onix3Extractor;
import com.tectonica.jonix.onix3.Product;
import com.tectonica.jonix.stream.JonixStreamer;
import org.apache.commons.io.IOUtils;
import org.apache.http.HttpEntity;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * Responsibility: Provide adapter to connect to ONIX resource.
 */
public final class OnixResourceAdapter {

    private static final Logger LOG = LoggerFactory.getLogger(OnixResourceAdapter.class);
    private CloseableHttpClient httpClient;
    private HttpPost httpPost;
    private String queryElement;
    private String queryString;
    private String username;
    private String password;

    private void initialise(String url) {
        httpClient = HttpClients.createDefault();
        httpPost = new HttpPost(url);
    }

    public void setResource(String url) {
        initialise(url);
    }

    void setQueryElement(String element) {
        this.queryElement = element;
    }

    void setQueryString(String string) {
        this.queryString = string;
    }

    public void build() throws UnsupportedEncodingException {

        LOG.info("Attempting to retrieve ONIX data from " + httpPost.getURI()
                + " with element: " + this.queryElement
                + " and query: " + this.queryString);
        List<NameValuePair> nameValuePair = new ArrayList<>();
        nameValuePair.add(new BasicNameValuePair("username", username));
        nameValuePair.add(new BasicNameValuePair("password", password));
        nameValuePair.add(new BasicNameValuePair("element", queryElement));
        nameValuePair.add(new BasicNameValuePair("query", queryString));
        httpPost.setEntity(new UrlEncodedFormEntity(nameValuePair));
    }

    String execute() throws IOException {
        String returnValue;
        try (CloseableHttpResponse closeableHttpResponse = httpClient.execute(httpPost)) {
            int statusCode = closeableHttpResponse.getStatusLine().getStatusCode();
            if (statusCode >= 200 && statusCode <= 400) {
                HttpEntity entity = closeableHttpResponse.getEntity();
                returnValue = processEntity(entity);
            } else {
                throw new Error("Attempt to retrieve data from " + httpPost.getURI()
                        + " resulted in status code " + statusCode);
            }
        }
        return returnValue;
    }

    private String processEntity(HttpEntity entity) throws IOException {
        InputStream entityInputStream = entity.getContent();
        String returnValue = IOUtils.toString(entityInputStream, StandardCharsets.UTF_8);
        IOUtils.closeQuietly(entityInputStream);
        EntityUtils.consume(entity);
        return returnValue;
    }

    void setUserName(String username) {
        this.username = username;
    }

    void setPassword(String password) {
        this.password = password;
    }

    public List<Product> extractOnix(String onixData) {
        List<Product> products = new ArrayList<>();
        JonixStreamer jonixStreamer = new JonixStreamer(new Onix3Extractor() {
            @Override
            protected boolean onProduct(Product product, JonixStreamer streamer) {
                products.add(product);
                return true;
            }
        });
        jonixStreamer.read(IOUtils.toInputStream(onixData, StandardCharsets.UTF_8), StandardCharsets.UTF_8.name());
        return products;
    }
}
