package no.deichman.services.entity.patch;

import org.apache.jena.rdf.model.Statement;

/**
 * Responsibility: TODO.
 */
public final class Patch {

    private String operation = null;
    private Statement statement = null;
    private String graph = null;

    public Patch(String operation, Statement statement, String graph){
        this.operation = operation;
        this.statement = statement;
        this.graph = graph;
    }

    public static Patch addPatch(Statement statement, String graph) {
        return new Patch("ADD", statement, graph);
    }

    public static Patch delPatch(Statement statement, String graph) {
        return new Patch("DEL", statement, graph);
    }

    public String getOperation() {
        return operation;
    }

    public Statement getStatement() {
        return statement;
    }

    public String getGraph() {
        return graph;
    }

}
