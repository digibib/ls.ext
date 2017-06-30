package no.deichman.services.entity.z3950;

/**
 * Responsibility: Provide details of Z39.50 targets.
 */
public enum Target {
    BIBBI("bibbi", "normarc"),
    LOC("loc", "marc21"),
    DFB("dfb", "normarc");

    private String databaseName;
    private String dataFormat;

    public String getDatabaseName() {
        return databaseName;
    }

    public String getDataFormat() {
        return dataFormat;
    }


    Target(String databaseName, String dataFormat) {
        this.databaseName = databaseName;
        this.dataFormat = dataFormat;
    }
}
