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
        * `sudo apt-get install virtualbox`
        * vagrant > 1.5 - install deb manually: https://www.vagrantup.com/downloads.html
    - OSX: We recommend using [homebrew](http://brew.sh/) and [homebrew cask](http://caskroom.io/)
        * `brew cask install virtualbox`
        * `brew cask install vagrant`
    - Windows: (untested, YMMV)
        * Download and install "VirtualBox platform package" for Window hosts: [Virtualbox Downloads](https://www.virtualbox.org/wiki/Downloads)
        * Download and install Vagrant for Windows: [Vagrant Downloads](https://www.vagrantup.com/downloads)
        * Install Cygwin/X by following this procedure: [Setting Up Cygwin/X](http://x.cygwin.com/docs/ug/setup.html)
          - Important! In step 15 you must also choose the following packages:
            * git
            * make
            * openssh
          - We also recommend these:
            * curl
            * git-completion
            * tig
            * vim
            * wget
        * After installing Cygwin/X  Windows users should use the program "Cygwin64 Terminal" for git, make etc. 
2. Clone this repo from the command line (in a directory of your choice): 
   ```git clone https://github.com/digibib/ls.ext.git``` 
3. `cd ls.ext` into your cloned repo.
4. From the command line run: `make` to bootstrap the environment and run the tests.

### Running without public ports

On an CI server you would not want to open uneccesary ports. This can be avoided by prefixing `make` with `NO_PUBLIC_PORTS`:
   `NO_PUBLIC_PORTS make`

See [Makefile](Makefile) for more commands.

### Adding graphical browser support
If you want a different browser than headless phantomjs in testing, we have installed firefox in ls.test and use X11
forwarding over ssh to show you the browser window as you run the test from inside ls.test.

If you host is OSX (> 1.5) or Windows you need to install XWindows support:

 - OSX: `brew cask install xquartz`
 - Windows: Install Cygwin/X (untested by us, but should in theory be possible)

To use you can either set `TESTBROWSER=<your favorite browser>` as an environment variable on your system or pass it to `make`. We currently support the following browsers:
- firefox
- chrome (we actually use chromium-browser)

Example:
`make test TESTBROWSER=firefox`  (  -- or  `TESTBROWSER=firefox make test` )  

### Running a single test 

You can pass arguments to Cucumber, e g which feature to test, like this (you must include `TEST_PROFILE=wip` if it is a scenario which is still marked as work-in-progress (`@wip`):

```
make test TESTPROFILE=wip CUKE_ARGS='features/legg_til_avdeling.feature'
```

### Running a single test or scenario

You can also run a single feature or scenario by title:

```
make test FEATURE="Title of feature|scenario"
```

## Illustration
![Alt text](stack.png?raw=true "Stack")
