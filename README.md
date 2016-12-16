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
and [Docker Engine](https://www.docker.com/docker-engine) for Docker container orchestration.


## Usage

For local setup and to run tests, we use a vagrant setup.

Docker containers are used both in development and in production.

## Installation and Quickstart

(for detailed installation, read [Installation](#Installation))

Having installed all prerequisites, system cat be set up my:

`make`:     Installs all, sets up and runs all tests (take a lunch break)

Step-wise:

```
make up:        Starts Vagrant box
make provision: Provisions box, downloads all code and dependencies, creates and starts containers
make test:      Runs all tests
make cuke_test  Run only feature tests
```

## Docker Compose

Docker Compose is used for orchestration/deployment of service components (Docker containers).

Three environment setups:
```
dev:    template: docker-compose-template-dev.yml
build:  template: docker-compose-template-dev-CI.yml
prod:   template: docker-compose-template-prod-yml
```

Environment variables are used to provision templates according to base environment

## Environments

Develop:
```
export LSDEVMODE=dev

* some docker containers are built and run on demand:
  - catalinker    (handled by docker-compose)
  - patron-client (handled by docker-compose)
  - overview      (handled by docker-compose)
  - services      (handled by gradle)
```

Build:

`export LSDEVMODE=build`

Build process is handled by Jenkins CI.
Docker containers are built, Unit Tests, Module Tests and Feature Tests are run.

If success, docker images are pushed to Docker Registry using GITREF as tag

Production:

Deployment is setup in docker-compose-template-prod-yml, and the specified instance is deployed by Jenkins.

GITREF is used to pull correct docker images of (services, catalinker and patron-client).

KOHA_IMAGE_TAG is used to pull specified Koha build

## Installation of local development environment

1. Install virtualbox and vagrant (and X11-server on OSX - for development):
    - Ubuntu:
        * `sudo apt-get install virtualbox`
        * vagrant > 1.5 - install deb manually: https://www.vagrantup.com/downloads.html
    - OSX: We recommend using [homebrew](http://brew.sh/) and [homebrew cask](http://caskroom.io/), but you can install these manually if you prefer (see download links).
        * `brew cask install virtualbox` -- or [Virtualbox Downloads](https://www.virtualbox.org/wiki/Downloads)
        * `brew cask install vagrant` -- or [Vagrant Downloads](https://www.vagrantup.com/downloads)
        * `brew cask install xquartz` -- or [XQuartz Download](http://xquartz.macosforge.org/landing/)
2. Clone this repo from the command line (in a directory of your choice):
   ```git clone https://github.com/digibib/ls.ext.git```
3. `cd ls.ext` into your cloned repo.
4. Run `export LSDEVMODE=dev` in your shell. You will always want this environment variable to be set during development.
5. From the command line run: `make` to bootstrap the environment and run the tests.

Run `make help` for more commands.

### Cleaning the database

The database (running as a docker container in vm-ship) is not destroyed when running `make clean`, but needs a separate `make clean_db` (which will ask you for confimation). This is done so you can retain your database even if you need to rebuild the rest of your environment. After a `make clean_db` you must `make` or at least `make up_db provision_ext`.

### Running without public ports

On an CI server you would not want to open uneccesary ports. This can be avoided by prefixing `make` with `NO_PUBLIC_PORTS`:
   `NO_PUBLIC_PORTS make`

### Adding graphical browser support

If you want a different browser than headless phantomjs in testing, ~~we have installed firefox in vm-test and use X11
forwarding over ssh to show you the browser window as you run the test from inside vm-test~~.

To use you can either set `TESTBROWSER=<your favorite browser>` as an environment variable on your system or pass it to `make`. We currently support the following browsers:
- firefox
- chrome (we actually use chromium-browser)

Example:
`make test TESTBROWSER=firefox`  (  -- or  `TESTBROWSER=firefox make test` )

### Running a single test

You can pass arguments to Cucumber, e g which feature to test, like this (you must include `TESTPROFILE=wip` if it is a scenario which is still marked as work-in-progress (`@wip`):

```
make test TESTPROFILE=wip CUKE_ARGS='features/legg_til_avdeling.feature'
```

### Running a single test or scenario

You can also run a single feature or scenario by title:

```
make test FEATURE="Title of feature|scenario"
```

### Typical workflow for creating new feature test

The first step for creating a new feature is authoring a test, in this case a verbal description of how you want the system to perform. This is a step-by-step decription of how you do this from your computer. You need to have completed the steps above to make this work.

1. Open terminal
2. Change directory to LS.ext by typing

```
cd (foldername where you keep your projects)/LS.ext/test/features
```
Then type

```
git up
```

3. Open the editor of your choice to create the test

   - create a file name for the feature you are writing a test for
   - start by adding a "Egenskap" that explains the feature in the simplest way
   - Then follows the typical "User story" format (with one change).

```
Feature: Title of the feature
  As a (role)
  I want to (what you want to accomplish)
  So therefore I need (what you want to do)
```

It often makes for bad grammar, but helps us focus on what we want to achieve, rather than how we achieve it.

  - Then you add the Scenario description. Add @wip before the scenario to make sure the test is not run until the feature is done.

    Format:

```
  Scenario: Title of the scenario
    Gitt (condition og precondition)
    Og (another condition or precondition)
    Når (user input)
    Og (another user input)
    Så (expected result)
    Og (another expected result)
```
    (you can have none or several "og" to each step)

    Please follow formatting and spacing rules from the other test descriptions

4. Return to the terminal to ensure the test is in proper format

```
make test TESTPROFILE=wip
```

5. Stay in the terminal to commit the changes to github

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
