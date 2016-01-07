FROM ubuntu:trusty

RUN apt-get update && apt-get install -y \
    build-essential \
    zlib1g-dev \
   	wget \
   	unzip \
   	software-properties-common \
   	lxc \
   	firefox \
    chromium-browser && \
    apt-get clean

RUN add-apt-repository ppa:tanguy-patte/phantomjs
RUN add-apt-repository ppa:brightbox/ruby-ng
RUN apt-get update && apt-get install -y --force-yes phantomjs ruby2.2 ruby2.2-dev && apt-get clean

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

RUN apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D && \
  echo "deb http://apt.dockerproject.org/repo ubuntu-trusty main" | tee /etc/apt/sources.list.d/docker.list && \
  apt-get update && apt-get install -y docker-engine && apt-get clean

VOLUME ["/tests"]
WORKDIR /tests