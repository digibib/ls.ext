FROM java:8-jre

ENV FUSEKI_ARCHIVE http://archive.apache.org/dist/
ENV FUSEKI_VERSION 2.4.0
ENV FUSEKI_SHA1 be9be0f14bdc9232d3c9d56a34ca9e1bf962ae69
ENV FUSEKI_HOME /jena-fuseki

WORKDIR /tmp
RUN echo "$FUSEKI_SHA1  fuseki.tar.gz" > fuseki.tar.gz.sha1
RUN wget -q -O fuseki.tar.gz $FUSEKI_ARCHIVE/jena/binaries/apache-jena-fuseki-$FUSEKI_VERSION.tar.gz && \
    sha1sum -c fuseki.tar.gz.sha1 && \
    tar zxf fuseki.tar.gz && \
    mv apache-jena-fuseki* $FUSEKI_HOME && \
    rm fuseki.tar.gz* && \
    cd $FUSEKI_HOME && rm -rf fuseki.war

ENV FUSEKI_BASE /data
RUN mkdir -p /data/databases/ds

COPY shiro.ini /data/shiro.ini
COPY log4j.properties /data/log4j.properties

CMD ["/jena-fuseki/fuseki-server", "--quiet", "--gzip=true", "--tdb=/data/databases/ds", "/ds"]