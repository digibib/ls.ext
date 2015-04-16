#!/bin/bash
hash rake
if [ $? -eq 0 ] ; then
	echo "Ruby stuff already installed.";
else
  echo "Ruby stuff installing ..."
  sudo apt-get install  --quiet --assume-yes build-essential g++ git-core curl zlib1g-dev build-essential libssl-dev libreadline-dev libyaml-dev libsqlite3-dev sqlite3 libxml2-dev libxslt1-dev libcurl4-openssl-dev python-software-properties libffi-dev > /dev/null
  cd
  wget --quiet http://ftp.ruby-lang.org/pub/ruby/2.2/ruby-2.2.1.tar.gz
  tar -xzvf ruby-2.2.1.tar.gz > /dev/null
  cd ruby-2.2.1/
  ./configure > /dev/null
  make > /dev/null
  sudo make install > /dev/null
  echo $(ruby -v)
  sudo gem install bundler
  sudo gem install rake
  echo "Ruby stuff installed."
fi
