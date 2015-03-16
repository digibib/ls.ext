#!/bin/bash
if [ command -v javac >/dev/null 2>&1 ]; then
	echo "JDK already installed.";
else
  echo "Installing jdk ..."
  sudo apt-get install  --quiet --assume-yes openjdk-7-jdk
  echo "JDK installed."
fi
