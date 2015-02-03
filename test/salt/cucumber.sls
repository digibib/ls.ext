Europe/Oslo:
  timezone.system:
    - utc: True

installpkgs:
  pkg.installed:
    - pkgs:
      - ruby1.9.1-dev
      - phantomjs
      - firefox
      - chromium-browser

install_chromedriver:
  pkg.installed:
    - pkgs:
      - unzip
  archive.extracted:
    - name: /usr/local/bin/
    - source: http://chromedriver.storage.googleapis.com/2.10/chromedriver_linux64.zip
    - archive_format: zip
    - source_hash: md5=058cd8b7b4b9688507701b5e648fd821
    - if_missing: /usr/local/bin/chromedriver
    - requires:
      - pkg: unzip
  file.managed:
    - name: /usr/local/bin/chromedriver
    - replace: False
    - mode: 755
    - requires:
      - archive: install_chromedriver

{% for gem in
  'rspec',
  'cucumber',
  'pry',
  'pry-nav',
  'watir-webdriver' %}
{{ gem }}:
  gem.installed:
    - requires:
      - pkg: ruby1.9.1-dev
{% endfor %}

selenium-webdriver:
  gem.installed:
    - version: 2.44.0
