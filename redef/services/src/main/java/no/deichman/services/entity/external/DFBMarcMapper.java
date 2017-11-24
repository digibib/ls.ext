package no.deichman.services.entity.external;

import org.marc4j.marc.ControlField;

/**
 *  Extends MARCMapper by extracting local id from 001.
 */
public class DFBMarcMapper extends MARCMapper {
    DFBMarcMapper(String mediaType, String cataloguingSourceUri, boolean simpleIdGenerator) {
        super(mediaType, cataloguingSourceUri, simpleIdGenerator);
    }

    DFBMarcMapper(String mediaType, Target cataloguingSource) {
        super(mediaType, cataloguingSource);
    }

    DFBMarcMapper(String mediaType, Target cataloguingSource, boolean simpleIdGenerator) {
        super(mediaType, cataloguingSource, simpleIdGenerator);
    }

    @Override
    protected final boolean handleControlFieldHook(ControlField controlField, Work work, Publication publication) {
        if (controlField.getTag().equals("001")) {
            getControlFieldValue(controlField).ifPresent(publication::setCataloguingSourceIdentifier);
            return false;
        }
        return true;
    }
}
