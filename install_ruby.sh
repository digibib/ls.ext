#!/bin/bash
if hash mkmf 2>/dev/null; then
	echo "ruby-dev already installed.";
else
  echo "Installing ruby-dev ..."
  sudo apt-get update --quiet
  sudo apt-get install  --quiet --assume-yes ruby-dev build-essential
  echo "ruby-dev installed."
fi

