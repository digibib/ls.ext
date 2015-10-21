
{% set repo = 'digibib' %}
{% set image = 'redef-patron-client-skeleton' %}
{% set tag = 'latest' %}
{% set build_context = '/vagrant/redef/patron-client' %}
{% set dockerfile = 'Dockerfile' %}

{% include 'docker-build.sls-fragment' %}
