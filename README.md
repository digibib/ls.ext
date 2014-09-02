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

1. Install virtualbox and vagrant (and X11-server on OSX/Windows - for development):
    - Ubuntu: 
        * `sudo apt-get install virtualbox`
        * vagrant > 1.5 - install deb manually: https://www.vagrantup.com/downloads.html
    - OSX: We recommend using [homebrew](http://brew.sh/) and [homebrew cask](http://caskroom.io/)
        * `brew cask install virtualbox`
        * `brew cask install vagrant`
    - Windows:
        * Download and install "VirtualBox platform package" for Window hosts: [Virtualbox Downloads](https://www.virtualbox.org/wiki/Downloads)
        * Download and install Vagrant for Windows: [Vagrant Downloads](https://www.vagrantup.com/downloads)
        * Reboot your machine.
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
        * After installing Cygwin/X Windows users should use the program "XWin Server" for commands like git, make etc. 
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

To use you can either set `TESTBROWSER=<your favorite browser>` as an environment variable on your system or pass it to `make`. We currently support the following browsers:
- firefox
- chrome (we actually use chromium-browser)

Example:
`make test TESTBROWSER=firefox`  (  -- or  `TESTBROWSER=firefox make test` )  

### Running development tools from inside the ls.test virtual machine

These tools also need support for X11 forwarding on the host.

* Sublime: `make sublime`

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

### Typical workflow for creating new feature test

@wip Arve

The first step for creating a new feature is authoring a test, in this case a verbal description of how you want the system to perform. This is a step-by-step decription of how you do this from your computer. You need to have completed the steps above to make this work.

1) Open terminal
Change directory to LS.ext by typing
```
cd (foldername where you keep your projects)/LS.ext/test/features
```
Then type 
```
git up
```

2) Open the editor of your choice to create the test

- create a file name for the feature you are writing a test for
- start by adding a "Egenskap" that explains the feature in the simplest way
- Then follows the typical "User story" format (with one change): 

As a (role)
I want to (what you want to accomplish)
So therefore I need (what you want to do)

It often makes for bad grammar, but helps us focus on what we want to achieve, rather than how we achieve it.

- Then you add the Scenario description. Add @wip before the scenario to make sure the test is not run until the feature is done.

Format: 
  Scenario: Title of the scenario

  Gitt (condition og precondition)

  Og (another condition or precondition)

  Når (user input)

  Og (another user input)

  Så (expected result)
  
  Og (another expected result)

(you can have none or several "og" to each step)

Please follow formatting and spacing rules from the other test descriptions

3) Return to the terminal to ensure the test is in proper format

```
make test TESTPROFILE=wip
```

4) Stay in the terminal to commit the changes to github

```
git up
```
to check you have all the latest changes from github
```
git status
```
to check the difference between your version and the master
```
git add (the filename(s) you want to push to github)
```
```
git commit -m "free text description of the change (less than 50 characters)"
```
and finally
```
git push
```

### Monitoring of logs with devops, a logserver

You can start the virtual machine devops (aka logserver) to monitor your logs. Devops has the following stack running:
- logstash: to collect and process log events from logstash-forwarder installed on the servers, in our case ls.ext
- elasticsearch: to store and index the log events
- kibana: to present a web interface for searching and visualizing the logs


To fire up the logserver, simply do
```
make up_devops
```
and point your favorite browser to [http://192.168.50.21/kibana-3.1.0](http://192.168.50.21/kibana-3.1.0/index.html#/dashboard/file/logstash.json)


## Illustration
![Alt text](stack.png?raw=true "Stack")
