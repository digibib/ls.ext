#Service layer/backend (JVM).

Services is the API layer for LS.Ext. It is packaged as an embedded jetty application that provides REST services for integration between components (including linked data and library holdings) creation and maintainance of resources for LS.Ext.

##Technologies

* Java
* JAX-RS (REST interface)
* Jena (RDF handling)
* GSON (JSON handling)

##Test

* JUnit (Unit tests)
* Mockito (Mocking)

Integration tests for the API are provided as [Cucumber tests](https://github.com/digibib/ls.ext/tree/master/test/features/katalogisering/api) that can be run from the LS.Ext Makefile.

##Build

* Gradle (Build environment)

See [Makefile](Makefile).
