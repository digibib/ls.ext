installpkgs:
  pkg.latest:
    - pkgs:
      - ruby1.9.1-dev
      - phantomjs

{% for gem in
  'rspec',
  'cucumber',
  'watir-webdriver' %}
{{ gem }}:
  gem.installed:
    - requires:
      - pkg: ruby1.9.1-dev
{% endfor %}
