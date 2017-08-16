package no.deichman.services.entity.onix;

import no.deichman.services.entity.z3950.Publication;
import no.deichman.services.entity.z3950.Work;

/**
 * Responsibility: Provide a placeholder for objects mapped from ONIX.
 */
public final class TopLevelMappingObject {
    private Work work;
    private Publication publication;

    public TopLevelMappingObject(Work work, Publication publication) {
        this.work = work;
        this.publication = publication;
    }

    public TopLevelMappingObject() {

    }

    public void setWork(Work work) {
        this.work = work;
    }

    public Work getWork() {
        return work;
    }
}
