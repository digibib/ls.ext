
package no.deichman.services.entity.kohaadapter;

import javax.xml.xpath.XPathExpressionException;

import com.hp.hpl.jena.rdf.model.Model;

/**
 * Responsibility: TODO.
 */
public interface KohaAdapter {
    Model getBiblio(String biblioNo);
    String getNewBiblio() throws XPathExpressionException, Exception;
}
