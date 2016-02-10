package no.deichman.services.uridefaults;

import org.junit.Test;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

import static org.junit.Assert.assertEquals;

public class BaseURITest {
    private BaseURI baseURI = BaseURI.local();

    @Test
    public void canGetBaseURIs() {
        List<String> entities = new ArrayList<String>(){{
            add("work/");
            add("publication/");
            add("ontology#");
            add("ontology#example");
            add("person/");
            add("authorized_values/");
            add("ui#");
            add("exemplar/");
            add("placeOfPublication/");
            add("publisher/");
        }};

        entities.forEach(s -> {
            String expect = "http://deichman.no/" + s;
            String actual = null;
            String[] match = s.split("[#/]");
            String methodName = match[0].replace("authorized_", ""); //name mismatch handler

            try {
                if (match.length > 1) {
                    Method method = baseURI.getClass().getMethod(methodName, String.class);
                    actual = (String) method.invoke(baseURI, match[1]);
                } else {
                    Method method = baseURI.getClass().getMethod(methodName);
                    actual = (String) method.invoke(baseURI);
                }
            } catch (NoSuchMethodException | InvocationTargetException | IllegalAccessException e) {
                e.printStackTrace();
            } finally {
                assertEquals("Did not get expected URI", expect, actual);
            }
        });


    }
}
