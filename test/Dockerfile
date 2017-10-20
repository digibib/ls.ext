FROM ubuntu:trusty

RUN apt-get update && apt-get install -y \
    build-essential \
    zlib1g-dev \
    wget \
    unzip \
    software-properties-common \
    libxi6 \
    libgconf-2-4 \
    chromium-browser \
    mysql-client \
    apparmor && \
    apt-get clean

RUN add-apt-repository ppa:brightbox/ruby-ng
RUN apt-get update && apt-get install -y --force-yes ruby2.3 ruby2.3-dev && apt-get clean

RUN wget --quiet http://chromedriver.storage.googleapis.com/2.24/chromedriver_linux64.zip && \
    unzip chromedriver_linux64.zip -d /usr/local/bin/ && rm chromedriver_linux64.zip && \
    chmod +x /usr/local/bin/chromedriver

RUN wget --quiet https://github.com/Medium/phantomjs/releases/download/v2.1.1/phantomjs-2.1.1-linux-x86_64.tar.bz2 && \
    bzip2 -d phantomjs-2.1.1-linux-x86_64.tar.bz2 && \
    tar -f phantomjs-2.1.1-linux-x86_64.tar -x phantomjs-2.1.1-linux-x86_64/bin/phantomjs && \
    mv phantomjs-2.1.1-linux-x86_64/bin/phantomjs /usr/local/bin &&\
    rm phantomjs-2.1.1-linux-x86_64.tar &&\
    rm -r phantomjs-2.1.1-linux-x86_64

RUN gem install \
    rspec \
    pry \
    rdf \
    json-ld \
    rest-client \
    nokogiri \
    bcrypt \
    faker

RUN gem install cucumber -v 2.4.0
RUN gem install selenium-webdriver -v 3.0.3
RUN gem install watir -v 6.0.2
RUN gem install watir-scroll

RUN wget https://get.docker.com/builds/Linux/x86_64/docker-1.10.3 && mv docker-1.10.3 /usr/bin/docker && chmod +x /usr/bin/docker

VOLUME ["/tests"]
WORKDIR /tests
