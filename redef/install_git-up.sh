#!/bin/bash
if gem list -i git-up 2>&1 >/dev/null; then
	echo "git-up already installed.";
else
  echo "Installing git-up ..."
  sudo apt-get install  --quiet --assume-yes ruby-dev
  sudo gem install git-up
  echo "git-up installed."
fi
