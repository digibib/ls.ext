ls.ext
======

Deichman Library System - Extended
Inneholder oppsett og konfigurasjon for biblioteksystem og eksterne komponenter, samt tester.
Oppsettet er basert på SaltStack for provisionering og Vagrant for virtualisering. 

## Bruk

Testene kjøres ved hjelp av et multi-machine vagrant-oppsett.

1. Installer virtualbox og vagrant:
    - Ubuntu: 
        * `apt-get install virtualbox`
        * vagrant > 1.5 - installér deb-manuelt: https://www.vagrantup.com/downloads.html
    - OSX: Anbefaler bruk av [homebrew](http://brew.sh/) og [homebrew cask](http://caskroom.io/)
        * `brew cask install virtualbox`
        * `brew cask install vagrant`
    - Windows: (ikke testet, YMMV)
        * [Virtualbox](https://www.virtualbox.org/wiki/Downloads)
        * [Vagrant](https://www.vagrantup.com/downloads)
        * Må også ha [git](http://git-scm.com/downloads)
        * ... og helst [make](http://gnuwin32.sourceforge.net/downlinks/make.php)
2. Kjør `make` for å sette opp testmiljøet, systemet under test og kjøre testene.

Se [Makefile](Makefile) for mer spesifikke kommandoer.

## Oppsett
![Alt text](stack.png?raw=true "Stack")