
{% set repo = 'digibib' %}
{% set image = 'redef-catalinker-skeleton' %}
{% set tag = 'latest' %}
{% set build_context = '/vagrant/redef/catalinker' %}
{% set dockerfile = 'Dockerfile' %}

{% include 'docker-build.sls-fragment' %}
