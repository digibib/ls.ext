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
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import no.deichman.services.error.PatchParserException;
import no.deichman.services.kohaadapter.KohaAdapter;
import no.deichman.services.kohaadapter.KohaAdapterDefault;
import no.deichman.services.patch.Patch;
import no.deichman.services.patch.PatchObject;
import no.deichman.services.patch.PatchParser;
import no.deichman.services.repository.Repository;
import no.deichman.services.repository.RepositoryDefault;
import no.deichman.services.repository.SPARQLQueryBuilder;
import no.deichman.services.uridefaults.BaseURI;
import no.deichman.services.uridefaults.BaseURIDefault;

/**
 * Responsibility: TODO.
 */
public final class ServiceImpl implements Service {

    private final Repository repository;
    private final KohaAdapter kohaAdapter;
    private final BaseURI baseURI;
    private final Property biblioId;

    public ServiceImpl(){
        this(new BaseURIDefault(), new RepositoryDefault(), new KohaAdapterDefault());
    }

    public ServiceImpl(BaseURI baseURI, Repository repository, KohaAdapter kohaAdapter){
        this.baseURI = baseURI;
        biblioId = ResourceFactory.createProperty(this.baseURI.getOntologyURI() + "biblio");
        this.repository = repository;
        this.kohaAdapter = kohaAdapter;
    }

    @Override
    public Model retrieveWorkById(String id) {

        Model m = ModelFactory.createDefaultModel();
        m.add(repository.retrieveWorkById(id));

        return m;
    }

    @Override
    public Model retrievePublicationById(String id) {

        Model m = ModelFactory.createDefaultModel();
        m.add(repository.retrievePublicationById(id));

        return m;
    }


    @Override
    public void updateWork(String work) {
        repository.updateWork(work);
    }

    @Override
    public Model retrieveWorkItemsById(String id) {
        Model allItemsModel = ModelFactory.createDefaultModel();
        Model model = ModelFactory.createDefaultModel();
        model.add(repository.retrieveWorkById(id));
        ResIterator subjectsIterator = model.listSubjects();

        while (subjectsIterator.hasNext()){
            Model tempModel = ModelFactory.createDefaultModel();
            NodeIterator n = model.listObjectsOfProperty(biblioId);
            while (n.hasNext()){
                tempModel.add(kohaAdapter.getBiblio(n.next().toString()));
            }
            SPARQLQueryBuilder sqb = new SPARQLQueryBuilder(baseURI);
            Query query = sqb.getItemsFromModelQuery(subjectsIterator.next().toString());
            QueryExecution qexec = QueryExecutionFactory.create(query, tempModel);
            Model itemsModel = qexec.execConstruct();

            allItemsModel.add(itemsModel);
        }

        return allItemsModel;
    }

    @Override
    public String createWork(String work) {
        return repository.createWork(work);
    }

    @Override
    public String createPublication(String publication) {
        return repository.createPublication(publication);
    }

    @Override
    public void deleteWork(Model work) {
        repository.delete(work);
    }

    @Override
    public void deletePublication(Model publication) {
        repository.delete(publication);
    }

    @Override
    public Model patchWork(String workId, String requestBody) throws PatchParserException {
        PatchParser patchParser = new PatchParser();
        try {
            patchParser.setPatchData(requestBody);
        } catch (Exception e) {
            throw new PatchParserException("Bad request");
        }
        List<PatchObject> patch = patchParser.parsePatch();
        List<Patch> patches = new ArrayList<Patch>();
        Iterator<PatchObject> iter = patch.iterator();
        while (iter.hasNext()) {
            patches.add(iter.next().toPatch());
        }
        repository.patch(patches);
        return retrieveWorkById(workId);
    }

    @Override
    public Model patchPublication(String publicationId, String requestBody) throws PatchParserException {
        PatchParser patchParser = new PatchParser();
        try {
            patchParser.setPatchData(requestBody);
        } catch (Exception e) {
            throw new PatchParserException("Bad request");
        }
        List<PatchObject> patch = patchParser.parsePatch();
        List<Patch> patches = new ArrayList<Patch>();
        Iterator<PatchObject> iter = patch.iterator();
        while (iter.hasNext()) {
            patches.add(iter.next().toPatch());
        }
        repository.patch(patches);
        return retrievePublicationById(publicationId);

    }

    @Override
    public boolean resourceExists(String resourceUri) {
        return repository.askIfResourceExists(resourceUri);
    }
}
