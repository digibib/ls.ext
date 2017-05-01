package no.deichman.services.rdf;

import no.deichman.services.uridefaults.BaseURI;

import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.ResourceFactory;


/**
 * Responsibility: provide role classes as constants.
 */
public final class Role {
    private Role() {}

    public static final Resource NAMESPACE = ResourceFactory.createResource(BaseURI.role());

    public static final Resource ACTOR = ResourceFactory.createResource(NAMESPACE.getURI() + "actor");
    public static final Resource ADAPTOR = ResourceFactory.createResource(NAMESPACE.getURI() + "adaptor");
    public static final Resource AUTHOR = ResourceFactory.createResource(NAMESPACE.getURI() + "author");
    public static final Resource COMPOSER = ResourceFactory.createResource(NAMESPACE.getURI() + "composer");
    public static final Resource CONDUCTOR = ResourceFactory.createResource(NAMESPACE.getURI() + "conductor");
    public static final Resource CONTRIBUTOR = ResourceFactory.createResource(NAMESPACE.getURI() + "contributor");
    public static final Resource COREOGRAPHER = ResourceFactory.createResource(NAMESPACE.getURI() + "coreographer");
    public static final Resource DIRECTOR = ResourceFactory.createResource(NAMESPACE.getURI() + "director");
    public static final Resource EDITOR = ResourceFactory.createResource(NAMESPACE.getURI() + "editor");
    public static final Resource FEATURING = ResourceFactory.createResource(NAMESPACE.getURI() + "featuring");
    public static final Resource ILLUSTRATOR = ResourceFactory.createResource(NAMESPACE.getURI() + "illustrator");
    public static final Resource LYRICIST = ResourceFactory.createResource(NAMESPACE.getURI() + "lyricist");
    public static final Resource MUSICALARRANGER = ResourceFactory.createResource(NAMESPACE.getURI() + "musicalArranger");
    public static final Resource PERFORMER = ResourceFactory.createResource(NAMESPACE.getURI() + "performer");
    public static final Resource PHOTOGRAPHER = ResourceFactory.createResource(NAMESPACE.getURI() + "photographer");
    public static final Resource PRODUCER = ResourceFactory.createResource(NAMESPACE.getURI() + "producer");
    public static final Resource PRODUCTIONCOMPANY = ResourceFactory.createResource(NAMESPACE.getURI() + "productionCompany");
    public static final Resource PUBLISHER = ResourceFactory.createResource(NAMESPACE.getURI() + "publisher");
    public static final Resource READER = ResourceFactory.createResource(NAMESPACE.getURI() + "reader");
    public static final Resource SCRIPTWRITER = ResourceFactory.createResource(NAMESPACE.getURI() + "scriptWriter");
    public static final Resource TRANSLATOR = ResourceFactory.createResource(NAMESPACE.getURI() + "translator");
}
