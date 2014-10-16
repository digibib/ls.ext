FROM debian:wheezy
MAINTAINER digibib <digitalutvikling@gmail.com>

ENV DEBIAN_FRONTEND noninteractive

# install dependencies
RUN apt-get update && apt-get install -yq \
    wget

# install logstash-forwarder from official repositories (note: quite old version as of 16.10.2014)
RUN wget -qO - http://packages.elasticsearch.org/GPG-KEY-elasticsearch | apt-key add -
RUN echo "deb http://packages.elasticsearch.org/logstashforwarder/debian stable main" >> /etc/apt/sources.list && \
    apt-get update && \
    apt-get install -yq logstash-forwarder

# muntable volumes
VOLUME [ "/var/log" ]

# add the config file
# TODO figure out how to get the file locally from salt
ADD https://raw.githubusercontent.com/digibib/ls.ext/logging/salt/koha/files/logstash-forwarder.conf /etc/logstash-forwarder

# add certificate
# TODO figure out how to get the file locally from sal
RUN mkdir -p /etc/pki/tls/certs
ADD https://raw.githubusercontent.com/digibib/ls.ext/logging/salt/koha/files/logstash-forwarder.crt /etc/pki/tls/certs/logstash-forwarder.crt

# run logstash-forwarder in the foreground
ENTRYPOINT ["opt/logstash-forwarder/bin/logstash-forwarder", "-config", "/etc/logstash-forwarder"]