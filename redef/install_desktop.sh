#!/bin/bash
if dpkg-query -l lubuntu-desktop 2>&1 >/dev/null; then
	echo "desktop already installed.";
else
  echo "Installing desktop ..."
  sudo apt-get update
  sudo apt-get install  --quiet --assume-yes xinit lubuntu-desktop
  sudo sed -i 's/console/anybody/g' /etc/X11/Xwrapper.config
  sudo rm -f /home/vagrant/.Xauthority
  echo "desktop installed. You need to restart/reload."
fi
