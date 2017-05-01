package no.deichman.services.rdf;

import no.deichman.services.uridefaults.BaseURI;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.ResourceFactory;

/**
 * Responsibility: provide constants for MediaType URIs.
 */
public final class MediaType {

    private MediaType() {}

    public static final Resource NAMESPACE = ResourceFactory.createResource(BaseURI.root() + "mediaType#");

    public static final Resource AUDIOBOOK = ResourceFactory.createResource(NAMESPACE + "Audiobook");
    public static final Resource BOOK = ResourceFactory.createResource(NAMESPACE + "Book");
    public static final Resource COMICBOOK = ResourceFactory.createResource(NAMESPACE + "ComicBook");
    public static final Resource E_BOOK = ResourceFactory.createResource(NAMESPACE + "E-book");
    public static final Resource FILM = ResourceFactory.createResource(NAMESPACE + "Film");
    public static final Resource GAME = ResourceFactory.createResource(NAMESPACE + "Game");
    public static final Resource LANGUAGECOURSE = ResourceFactory.createResource(NAMESPACE + "LanguageCourse");
    public static final Resource MUSICRECORDING = ResourceFactory.createResource(NAMESPACE + "MusicRecording");
    public static final Resource OTHER = ResourceFactory.createResource(NAMESPACE + "Other");
    public static final Resource PERIODICAL = ResourceFactory.createResource(NAMESPACE + "Periodical");
    public static final Resource SHEETMUSIC = ResourceFactory.createResource(NAMESPACE + "SheetMusic");
}
