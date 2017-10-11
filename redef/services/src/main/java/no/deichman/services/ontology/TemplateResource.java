package no.deichman.services.ontology;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import no.deichman.services.entity.EntityType;
import no.deichman.services.entity.ResourceBase;
import no.deichman.services.entity.repository.SPARQLQueryBuilder;
import no.deichman.services.uridefaults.BaseURI;
import no.deichman.services.utils.ResourceReader;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.SimpleSelector;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.rdf.model.StmtIterator;
import org.apache.jena.riot.Lang;
import org.apache.jena.update.UpdateAction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Singleton;
import javax.servlet.ServletConfig;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Optional;

import static com.google.common.collect.Lists.newArrayList;
import static java.lang.String.format;
import static java.util.stream.Collectors.toMap;
import static javax.ws.rs.core.Response.noContent;
import static javax.ws.rs.core.Response.ok;
import static no.deichman.services.rdf.RDFModelUtil.modelFrom;
import static no.deichman.services.restutils.MimeType.JSON;
import static no.deichman.services.restutils.MimeType.LD_JSON;
import static no.deichman.services.restutils.MimeType.UTF_8;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.apache.jena.rdf.model.ResourceFactory.createStatement;

/**
 * Responsibility: Return translated strings.
 */
@Singleton
@Path("/{type: " + EntityType.ALL_TYPES_PATTERN + " }")
public class TemplateResource extends ResourceBase {
    public static final SPARQLQueryBuilder SPARQL_QUERY_BUILDER = new SPARQLQueryBuilder();
    private final Logger log = LoggerFactory.getLogger(TemplateResource.class);
    public static final Gson GSON = new GsonBuilder().setPrettyPrinting().create();
    public static final Model MODEL = ModelFactory.createDefaultModel();

    @Context
    private ServletConfig servletConfig;

    public TemplateResource() {
        MODEL.add(modelFrom(new ResourceReader()
                .readFile("templates.ttl")
                .replace("__BASE_URI_ONTOLOGY__", BaseURI.ontology())
                .replace("__BASE_URI_ROOT__", BaseURI.root()), Lang.TURTLE));
    }

    private static String firstValue(Entry<String, List<String>> stringListEntry) {
        return stringListEntry.getValue().stream().findFirst().get();
    }

    @Override
    protected final ServletConfig getConfig() {
        return servletConfig;
    }

    @GET
    @Path("/template")
    @Produces({LD_JSON + UTF_8, JSON + UTF_8})
    public final Response getTemplateForResourceType(@PathParam("type") String type, @Context UriInfo uriInfo) {
        Map<String, String> queryParameters = uriInfo
                .getQueryParameters()
                .entrySet()
                .stream()
                .collect(toMap(Entry::getKey, TemplateResource::firstValue));
        final Model model = QueryExecutionFactory.create(SPARQL_QUERY_BUILDER.resourceTemplateQuery(type, queryParameters), MODEL).execDescribe();
        UpdateAction.parseExecute(SPARQL_QUERY_BUILDER.removeTemplateMatchTriples(), model);
        final long count = model.listSubjects()
                .toList()
                .stream()
                .filter(RDFNode::isURIResource)
                .count();
        if (count > 1) {
            log.warn(format("Template requested for %s with query %s resulted in %d templates.", type, uriInfo.getRequestUri().getRawQuery(), count));
        }
        // pick one URI to represent the desired template
        final Optional<Resource> resource = model.listSubjects().toList().stream().filter(RDFNode::isURIResource).findFirst();
        return resource.map((Resource r) -> {
            List<Statement> statementsWithOldSubject = newArrayList();
            List<Statement> statementsWithNewSubject = newArrayList();
            final StmtIterator statementsAboutTheTemplate = model.listStatements(new SimpleSelector() {
                @Override
                public boolean test(Statement s) {
                    return s.getSubject().equals(r);
                }
            });
            statementsAboutTheTemplate.forEachRemaining(s -> {
                statementsWithOldSubject.add(s);
                final String regex = format("(^.*%s)\\/(.*$)", type);
                final String queryPart = uriInfo.getRequestUri().getRawQuery() != null ? format("?%s", uriInfo.getRequestUri().getRawQuery()) : "";
                final String replacement = format("$1/template%s", queryPart);
                statementsWithNewSubject.add(
                        createStatement(
                                createResource(
                                        r.getURI().replaceAll(
                                                regex, replacement)), s.getPredicate(), s.getObject()));
            });
            model.remove(statementsWithOldSubject);
            model.add(statementsWithNewSubject);
            return ok().entity(getJsonldCreator().asJSONLD(model)).build();
        }).orElseGet(noContent()::build);
    }

}
