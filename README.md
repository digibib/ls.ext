ls.ext
======

Deichman Library System - Extended

Setup and configuration for the (future) library system for the Deichman
Library in Oslo, Norway.

Uses Koha as a core component and extends it with more components.

To make sure the entire system works, the configuration and development is
driven by acceptance tests - using [Cucumber](http://cukes.info/). For 
browser automation we use [Watir WebDriver](http://watirwebdriver.com).

This setup uses [Vagrant](http://www.vagrantup.com/) for local virtualisation 
and [SaltStack](http://docs.saltstack.com/) for automated provisioning.

## Usage

For local setup and to run tests, we use a multi-machine vagrant setup.

1. Install virtualbox and vagrant:
    - Ubuntu: 
        * `apt-get install virtualbox`
        * vagrant > 1.5 - install deb manually: https://www.vagrantup.com/downloads.html
    - OSX: We recommend using [homebrew](http://brew.sh/) and [homebrew cask](http://caskroom.io/)
        * `brew cask install virtualbox`
        * `brew cask install vagrant`
    - Windows: (untested, YMMV)
        * [Virtualbox](https://www.virtualbox.org/wiki/Downloads)
        * [Vagrant](https://www.vagrantup.com/downloads)
        * You also need [git](http://git-scm.com/downloads)
        * ... and [make](http://gnuwin32.sourceforge.net/downlinks/make.php)
2. From the command line run: `make` to bootstrap the environment and run the tests.
3. If you don't want port forwarding and X forwarding (aka Jenkins CI and headless testing), disable with:
   `NO_PUBLIC_PORTS make`

See [Makefile](Makefile) for more commands.

## Adding graphical browser support
If you want a different browser than headless phantomjs in testing, 
   set browser key in pillar/koha/admin.sls, e.g.:
   `  browser: :firefox`

   NB: Mac OS X (> 1.5) requires Xquartz (or other XWindows) in order for browser support to work, install 
   `brew cask install xquartz`



## Setup Illustration
![Alt text](stack.png?raw=true "Stack")
