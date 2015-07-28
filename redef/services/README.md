#Service layer/backend (JVM).

Services is the API layer for LS.Ext. It is packaged as an embedded jetty application that provides REST services for integration between components (including linked data and library holdings) creation and maintainance of resources for LS.Ext.

##Technologies

* Java (we strive for SDK8-compatibility)
* [Jetty](http://www.eclipse.org/jetty/)
* [JAX-RS 2.0](https://jax-rs-spec.java.net/nonav/2.0-rev-a/apidocs/index.html) (REST interface)
* [Jena](https://jena.apache.org/documentation/rdf/index.html) (RDF handling)
* [GSON](https://github.com/google/gson) (JSON handling)

##Test

* [JUnit](http://junit.org/) (Unit testing)
* [Mockito](http://mockito.org/) (Mocking)

Integration tests for the API are provided as [Cucumber tests](https://github.com/digibib/ls.ext/tree/master/test/features/katalogisering/api) that can be run from the LS.Ext Makefile.

##Build

* [Gradle](https://gradle.org/) (Build environment)

See [Makefile](Makefile).
