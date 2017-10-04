package no.deichman.services.entity.external;

import org.apache.commons.io.IOUtils;
import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

import javax.ws.rs.core.Response;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Source;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.StringWriter;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URLEncoder;

/**
 * Responsibility: connect to SRU.
 */
public class SRUHttpClient implements ExternalCatalogue{
    private static Transformer t;

    static {
        try {
            final TransformerFactory transformerFactory = TransformerFactory.newInstance();
            transformerFactory.setAttribute("indent-number", 2);
            t = transformerFactory.newTransformer(new StreamSource(SRUHttpClient.class.getClassLoader().getResourceAsStream("sru_2_marcxml.xsl")));
            t.setOutputProperty(OutputKeys.INDENT, "yes");
            t.setOutputProperty("{http://xml.apache.org/xslt}i‌​ndent-amount", "2");
        } catch (TransformerConfigurationException e) {
            throw new RuntimeException(e);
        }
    }

    private String endpoint;

    public SRUHttpClient(String url) throws MalformedURLException {
        this.endpoint = url;
    }

    final String getEndpoint() {
        return endpoint;
    }

    final void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }

    @Override
    public final SearchResultInfo getByField(String targetString, String term, String parameter) throws IOException {
        Target target = Target.valueOf(targetString.toUpperCase());
        final StringWriter writer;
        writer = new StringWriter();
        long numberOfRecords = 0;
        long nextRecordPosition = 0;
        try (
                CloseableHttpClient httpClient = HttpClients.createDefault();
                CloseableHttpResponse httpResponse = httpClient.execute(
                        new HttpGet(getURL(target, term, target.getParameterMap().getOrDefault(parameter, parameter))))
        ) {
            if (httpResponse.getStatusLine().getStatusCode() == Response.Status.OK.getStatusCode()) {
                final HttpEntity entity = httpResponse.getEntity();
                final byte[] xml = IOUtils.toByteArray(entity.getContent());

                DocumentBuilderFactory builderfactory = DocumentBuilderFactory.newInstance();
                builderfactory.setNamespaceAware(false);
                DocumentBuilder builder = builderfactory.newDocumentBuilder();
                Document xmlDocument = builder.parse(new ByteArrayInputStream(xml));

                XPathFactory factory = javax.xml.xpath.XPathFactory.newInstance();
                XPath xPath = factory.newXPath();

                XPathExpression numberOfRecordsXPath = xPath.compile("//searchRetrieveResponse//numberOfRecords");
                numberOfRecords = Math.round((Double) numberOfRecordsXPath.evaluate(xmlDocument, XPathConstants.NUMBER));

                XPathExpression nextRecordPositionXPath = xPath.compile("//searchRetrieveResponse//nextRecordPosition");
                nextRecordPosition = Math.round((Double) nextRecordPositionXPath.evaluate(xmlDocument, XPathConstants.NUMBER));

                Source s = new StreamSource(new ByteArrayInputStream(xml));
                final StreamResult streamResult = new StreamResult(writer);
                try {
                    t.transform(s, streamResult);
                } catch (TransformerException e) {
                    e.printStackTrace();
                }
                EntityUtils.consume(entity);
            }
        } catch (ParserConfigurationException | SAXException | XPathExpressionException e) {
            e.printStackTrace();
        }

        return new SearchResultInfo(writer.toString(), numberOfRecords, nextRecordPosition);
    }

    private String getURL(Target target, String term, final String parameter) {
        String encodedTerm = term;
        try {
            encodedTerm = URLEncoder.encode(term, "UTF-8");
        } catch (UnsupportedEncodingException ux) {
            // ignore, as it won't happen
        }
        return String.format("%s&operation=searchRetrieve&recordSchema=%s&query=%s=%s", endpoint, target.getDataFormat(), parameter, encodedTerm);
    }
}
