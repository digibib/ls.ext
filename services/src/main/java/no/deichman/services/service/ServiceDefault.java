package no.deichman.services.service;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import no.deichman.services.kohaadapter.KohaAdapter;
import no.deichman.services.kohaadapter.KohaAdapterDefault;
import no.deichman.services.repository.Repository;
import no.deichman.services.repository.RepositoryDefault;

public class ServiceDefault implements Service {

    private static Repository repository = new RepositoryDefault();
    private static KohaAdapter kohaAdapter = new KohaAdapterDefault();

    @Override
    public Model retriveWorkById(String id) {
        if (kohaAdapter.getCookies().isEmpty()) {
            kohaAdapter.login();
        }
        Model m = ModelFactory.createDefaultModel();
        m.add(repository.retrieveWorkById(id));

        /*
         TODO the relation between work-id and biblio-id must be
         fetched from the work-model.
         */
        if (id.equalsIgnoreCase("work_00004")) {
            m.add(kohaAdapter.getBiblio("626460"));
        }
        return m;
    }

    public static void setRepository(Repository repository) {
        ServiceDefault.repository = repository;
    }

    public static void setKohaAdapter(KohaAdapter kohaAdapter) {
        ServiceDefault.kohaAdapter = kohaAdapter;
    }

    @Override
    public Model listWork() {
        return repository.listWork();
    }

    @Override
    public void createWork(String work) {
        repository.createWork(work);
    }
}
