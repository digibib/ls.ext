#!/bin/bash
export SEMVER=14.1.4
export BUILD=141.1532.4
hash idea 2>&1
if [ $? -eq 0 ] ; then
	export INSTALLED_BUILD=$(readlink -f `which idea` | awk -F/ '{print $(NF-2)}')

	if [ "$INSTALLED_BUILD" == "idea-IU-$BUILD" ] ; then
	    echo "Correct version of idea, version: ${SEMVER}, build: ${BUILD}."
	    exit
    fi
fi

echo "Installing Idea, version: ${SEMVER}, build: ${BUILD}."
cd
sudo apt-get install --quiet --assume-yes libxtst6 libxi6 > /dev/null
wget --quiet https://download.jetbrains.com/idea/ideaIU-${SEMVER}.tar.gz
tar xfz ideaIU-${SEMVER}.tar.gz
export IDEA_DIR=$(ls -d idea-*)
sudo mv $IDEA_DIR /usr/local/lib/
sudo ln -sf /usr/local/lib/${IDEA_DIR}/bin/idea.sh /usr/local/bin/idea
echo "Idea installed."
