Europe/Oslo:
  timezone.system:
    - utc: True

phantomjsppa:
  pkgrepo.managed:
    - ppa: tanguy-patte/phantomjs
  pkg.latest:
    - name: phantomjs
    - refresh: True

installpkgs:
  pkg.installed:
    - pkgs:
      - firefox
      - chromium-browser

removepkgs:
  pkg.purged:
    - pkgs:
      - ruby1.9.1
      - ruby1.9.1-dev
      - ruby2.0-dev

rubyrepo:
  pkgrepo.managed:
    - ppa: brightbox/ruby-ng

rubies:
  pkg.installed:
    - pkgs:
      - ruby2.2
      - ruby2.2-dev
    - refresh: True
    - require:
      - pkgrepo: rubyrepo

install_chromedriver:
  pkg.installed:
    - pkgs:
      - unzip
  archive.extracted:
    - name: /usr/local/bin/
    - source: http://chromedriver.storage.googleapis.com/2.20/chromedriver_linux64.zip
    - archive_format: zip
    - source_hash: md5=245858cc984bd946df6a1e6719c8e6f5
    - if_missing: /usr/local/bin/chromedriver
    - requires:
      - pkg: unzip
  file.managed:
    - name: /usr/local/bin/chromedriver
    - replace: False
    - mode: 755
    - require:
      - archive: install_chromedriver

{% for gem in
  'rspec',
  'parallel_tests',
  'pry',
  'pry-nav',
  'rdf',
  'json-ld' %}
{{ gem }}:
  gem.installed:
    - require:
      - pkg: rubies
{% endfor %}

cucumber:
  gem.installed:
    - version: 2.1.0

selenium-webdriver:
  gem.installed:
    - version: 2.48.1

watir-webdriver:
  gem.installed:
    - version: 0.9.1
