Redefining library systems.
===

Modules
--

Modules in this project:

* [Patron client](patron-client/README.md)
* ["Catalinker"](catalinker/README.md)
* [Service layer/backend](services/README.md)

External modules/Docker containers used:

* [Elasticsearch](https://hub.docker.com/_/elasticsearch/) Document Indexing based on Lucene
  ( chosen due to its scalability, RESTfulness and support )
* [Fuseki](https://hub.docker.com/r/fisch42/fuseki/) RDF Store and endpoint
* [Kibana](https://hub.docker.com/_/kibana/) GUI Logging management tool
* [Logstash](https://hub.docker.com/_/logstash/) Log handler
* [DockerUI](https://hub.docker.com/r/dockerui/dockerui/) GUI for docker container management

Development environment
--

We use Vagrant and Virtualbox (prerequisites).

To get started developing do `make run-dev`.

See [Makefile](../Makefile).
