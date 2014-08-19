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
  cmd.run:
    - name: chmod +rx /usr/local/bin/chromedriver
    - requires:
      - archive: install_chromedriver

{% for gem in
  'rspec',
  'cucumber',
  'watir-webdriver' %}
{{ gem }}:
  gem.installed:
    - requires:
      - pkg: ruby1.9.1-dev
{% endfor %}
