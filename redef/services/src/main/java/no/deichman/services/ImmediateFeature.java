package no.deichman.services;

import org.glassfish.hk2.api.ServiceLocator;
import org.glassfish.hk2.utilities.ServiceLocatorUtilities;

import javax.inject.Inject;
import javax.ws.rs.core.Feature;
import javax.ws.rs.core.FeatureContext;

/**
 * Responsibility: enable @Immediate annotations.
 */
public class ImmediateFeature implements Feature {

    @Inject
    public ImmediateFeature(ServiceLocator locator) {
        ServiceLocatorUtilities.enableImmediateScope(locator);
    }

    @Override
    public final boolean configure(FeatureContext context) {
        return true;
    }
}
