
package no.deichman.services.kohaadapter;

import com.hp.hpl.jena.rdf.model.Model;
import java.util.Map;
import javax.ws.rs.core.NewCookie;

public interface KohaAdapter {
    
    void login();
    Model getBiblio(String biblioNo);
    Map<String, NewCookie> getCookies();
}
