FROM ubuntu:trusty

RUN apt-get update && apt-get install -y \
    build-essential \
    zlib1g-dev \
   	wget \
   	unzip \
   	software-properties-common \
   	lxc \
   	firefox \
    chromium-browser

RUN add-apt-repository ppa:tanguy-patte/phantomjs
RUN add-apt-repository ppa:brightbox/ruby-ng
RUN apt-get update && apt-get install -y phantomjs ruby2.2 ruby2.2-dev

RUN wget http://chromedriver.storage.googleapis.com/2.20/chromedriver_linux64.zip && \
    unzip chromedriver_linux64.zip -d /usr/local/bin/ && rm chromedriver_linux64.zip

RUN gem install \
    rspec \
    pry \
    pry-nav \
    rdf \
    json-ld \
    rest-client \
    nokogiri

RUN gem install cucumber -v 2.1.0
RUN gem install selenium-webdriver -v 2.48.1
RUN gem install watir-webdriver -v 0.9.1

VOLUME ["/tests"]
WORKDIR /tests