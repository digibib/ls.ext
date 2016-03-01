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

RUN add-apt-repository ppa:brightbox/ruby-ng
RUN apt-get update && apt-get install -y --force-yes ruby2.2 ruby2.2-dev xvfb firefox && apt-get clean

RUN wget http://chromedriver.storage.googleapis.com/2.20/chromedriver_linux64.zip && \
    unzip chromedriver_linux64.zip -d /usr/local/bin/ && rm chromedriver_linux64.zip

RUN wget https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-2.1.1-linux-x86_64.tar.bz2 && \
    bzip2 -d phantomjs-2.1.1-linux-x86_64.tar.bz2 && \
    tar -f phantomjs-2.1.1-linux-x86_64.tar -x phantomjs-2.1.1-linux-x86_64/bin/phantomjs && \
    mv phantomjs-2.1.1-linux-x86_64/bin/phantomjs /usr/local/bin &&\
    rm phantomjs-2.1.1-linux-x86_64.tar &&\
    rm -r phantomjs-2.1.1-linux-x86_64

RUN gem install \
    rspec \
    pry \
    pry-nav \
    rdf \
    json-ld \
    rest-client \
    nokogiri \
    headless

RUN gem install cucumber -v 2.3.2
RUN gem install selenium-webdriver -v 2.48.1
RUN gem install watir-webdriver -v 0.9.1

RUN apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D && \
  echo "deb http://apt.dockerproject.org/repo ubuntu-trusty main" | tee /etc/apt/sources.list.d/docker.list && \
  apt-get update && apt-get install -y docker-engine && apt-get clean

VOLUME ["/tests"]
WORKDIR /tests