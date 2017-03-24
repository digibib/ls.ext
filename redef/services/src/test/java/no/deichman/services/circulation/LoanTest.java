package no.deichman.services.circulation;

import org.junit.Test;

import static org.junit.Assert.assertEquals;

/**
 * Responsibility: Test loan class.
 */
public class LoanTest {
    @Test
    public void setGetBiblio() throws Exception {
        Loan loan = new Loan();
        String biblio = "9990099";
        loan.setRecordId(biblio);
        assertEquals(biblio, loan.getRecordId());
    }
}
