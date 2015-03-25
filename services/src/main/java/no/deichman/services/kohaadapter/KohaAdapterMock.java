package no.deichman.services.kohaadapter;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;

public class KohaAdapterMock implements KohaAdapter {

    private final Model model = ModelFactory.createDefaultModel();
    
    @Override
    public Model getBiblio(String biblioNo) {
        return model;
    }

}
