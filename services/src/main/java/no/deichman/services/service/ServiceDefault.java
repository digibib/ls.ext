package no.deichman.services.service;

import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.NodeIterator;
import com.hp.hpl.jena.rdf.model.Property;
import com.hp.hpl.jena.rdf.model.ResIterator;
import com.hp.hpl.jena.rdf.model.ResourceFactory;

import no.deichman.services.SPARQLQueryBuilder;
import no.deichman.services.kohaadapter.KohaAdapter;
import no.deichman.services.kohaadapter.KohaAdapterDefault;
import no.deichman.services.repository.Repository;
import no.deichman.services.repository.RepositoryDefault;

public class ServiceDefault implements Service {

    private Repository repository = new RepositoryDefault();
    private KohaAdapter kohaAdapter = new KohaAdapterDefault();

    @Override
    public Model retriveWorkById(String id) {

        Model m = ModelFactory.createDefaultModel();
        m.add(repository.retrieveWorkById(id));

        return m;
    }

    public void setRepository(Repository repository) {
        this.repository = repository;
    }

    public void setKohaAdapter(KohaAdapter kohaAdapter) {
        this.kohaAdapter = kohaAdapter;
    }

    @Override
    public Model listWork() {
        return repository.listWork();
    }

    @Override
    public void createWork(String work) {
        repository.createWork(work);
    }

    @Override
    public Model retrieveWorkItemsById(String id) {
        if (kohaAdapter.getCookies().isEmpty()) {
            kohaAdapter.login();
        }
        Property p = ResourceFactory.createProperty("http://deichman.no/ontology#biblioId");
        Model m = ModelFactory.createDefaultModel();
        m.add(repository.retrieveWorkById(id));
        ResIterator it = m.listSubjects();
        Model itemModel = ModelFactory.createDefaultModel();

        while (it.hasNext()){
            NodeIterator n = m.listObjectsOfProperty(p);
            Model tempModel = ModelFactory.createDefaultModel();
            while (n.hasNext()){
                tempModel.add(kohaAdapter.getBiblio(n.next().toString()));
            }

            Query query = SPARQLQueryBuilder.getItemsFromModelQuery(it.next().toString());

            QueryExecution qexec = QueryExecutionFactory.create(query, tempModel);
            itemModel.add(qexec.execConstruct());
        }

        return itemModel;
    }
}
