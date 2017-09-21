package no.deichman.services.entity.z3950;

/**
 * Responsibility: map data from external resources to internal anonymous RDF.
 */
public final class Mapper {

    public Result map(String sourceName, SearchResultInfo recordSet) throws Exception {
        Target target = Target.valueOf(sourceName.toUpperCase());
        Result result = new Result(recordSet);
        MARCMapper marcMapper = new MARCMapper(true);
        result.setSource(target.getDatabaseName());

        if (target.getDataFormat().contains("marc")) {
            result.setHits(marcMapper.getMapping(recordSet.getMarxXmlContent()));
        } else {
            throw new Exception("No mapper identified for this resource");
        }
        return result;
    }
}
