FROM golang:1.6.2-wheezy

RUN apt-get update \
    && apt-get install -y \
    mysql-client \
    ruby-dev \
    && rm -rf /var/lib/apt/lists/*

RUN go get github.com/digibib/migtools/catmassage

RUN git clone https://github.com/digibib/migmarc2rdf /usr/src/migmarc2rdf
WORKDIR /usr/src/migmarc2rdf
RUN gem install bundler
RUN bundle install --without=test development


ARG MYSQL_DATABASE
ARG MYSQL_USER
ARG MYSQL_PASSWORD

ENV MYSQL_DATABASE ${MYSQL_DATABASE}
ENV MYSQL_USER ${MYSQL_USER}
ENV MYSQL_PASSWORD ${MYSQL_PASSWORD}