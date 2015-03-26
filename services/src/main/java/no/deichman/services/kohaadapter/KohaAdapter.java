
package no.deichman.services.kohaadapter;

import com.hp.hpl.jena.rdf.model.Model;
import java.util.Map;
import javax.ws.rs.core.NewCookie;

public interface KohaAdapter {
    
    public void login();
    public Model getBiblio(String biblioNo);
    public Map<String, NewCookie> getCookies();
}
