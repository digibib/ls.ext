package no.deichman.services.entity.external;

import org.marc4j.marc.DataField;

/**
 *  Extends MARCMapper by extracting local id from 015$a and $b.
 */
public class BSMarcMapper extends MARCMapper {
    BSMarcMapper(String mediaType, String cataloguingSourceUri, boolean simpleIdGenerator) {
        super(mediaType, cataloguingSourceUri, simpleIdGenerator);
    }

    BSMarcMapper(String mediaType, Target cataloguingSource) {
        super(mediaType, cataloguingSource);
    }

    BSMarcMapper(String mediaType, Target cataloguingSource, boolean simpleIdGenerator) {
        super(mediaType, cataloguingSource, simpleIdGenerator);
    }

    @Override
    protected final boolean handleDatafieldHook(DataField dataField, Work work, Publication publication) {
        if (dataField.getTag().equals("015")) {
            setUriObject(dataField, 'b', "cataloguingSource", CataloguingSource::translate, publication::setCataloguingSource);
            getSubfieldValue(dataField, 'a').ifPresent(publication::setCataloguingSourceIdentifier);
            return false;
        }
        return true;
    }
}
