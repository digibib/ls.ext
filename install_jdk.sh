#!/bin/bash
if hash javac 2>/dev/null; then
	echo "JDK already installed.";
else
  echo "Installing jdk ..."
  sudo apt-get install  --quiet --assume-yes openjdk-7-jdk
  echo "JDK installed."
fi
