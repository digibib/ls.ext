FROM golang:1.8

RUN apt-get update \
    && apt-get install -y \
    mysql-client \
    ruby-dev \
    rubygems \
    locales \
    && rm -rf /var/lib/apt/lists/*

# Set Norwegian locale UTF-8 for proper mysql inserts
RUN sed -i -e 's/# nb_NO.UTF-8 UTF-8/nb_NO.UTF-8 UTF-8/' /etc/locale.gen && \
    echo 'LANG="nb_NO.UTF-8"'>/etc/default/locale && \
    dpkg-reconfigure --frontend=noninteractive locales && \
    update-locale LANG=nb_NO.UTF-8

RUN go get github.com/digibib/migtools/catmassage
RUN go get github.com/digibib/migtools/construct
RUN go get github.com/digibib/migtools/syncbranches
RUN go get github.com/digibib/migtools/syncimages
RUN go get github.com/digibib/migtools/patronmassage
RUN go get github.com/digibib/migtools/verify
RUN go get github.com/digibib/migtools/res2sql
RUN go get github.com/digibib/migtools/nt2ttl

RUN git clone https://github.com/digibib/migmarc2rdf /usr/src/migmarc2rdf
WORKDIR /usr/src/migmarc2rdf
RUN gem install bundler
RUN bundle install --without=test development

ARG MYSQL_DATABASE
ARG MYSQL_USER
ARG MYSQL_PASSWORD

ENV LANG nb_NO.UTF-8
ENV MYSQL_DATABASE ${MYSQL_DATABASE}
ENV MYSQL_USER ${MYSQL_USER}
ENV MYSQL_PASSWORD ${MYSQL_PASSWORD}
