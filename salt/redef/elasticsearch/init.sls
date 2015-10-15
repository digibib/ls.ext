{% set image = 'elasticsearch' %}
{% set tag = '2.0.0-beta2' %}
{% set force_pull = false %}

{% include 'docker-pull.sls-fragment' %}

{% set container = 'elasticsearch_container' %}
{% set ports = ["9200/tcp", "9300/tcp"] %}
{% set environment = {} %}
{% set port_bindings = {'9200/tcp': { 'HostIp': pillar['redef']['elasticsearch']['http']['binding'], 'HostPort': pillar['redef']['elasticsearch']['http']['port'] } ,
                        '9300/tcp': { 'HostIp': pillar['redef']['elasticsearch']['native']['binding'], 'HostPort': pillar['redef']['elasticsearch']['native']['port'] } } %}
{% set data_volume = { 'container': 'elasticsearch_data', 'image': 'busybox', 'tag': 'latest', 'volumes': ['/usr/share/elasticsearch/data'] } %}
{% set command = 'elasticsearch --network.host _non_loopback_' %} # https://github.com/docker-library/elasticsearch/issues/52
{% set host_volume_bindings = [ { 'host': '/vagrant/salt/redef/elasticsearch/config/elasticsearch.yml', 'container': '/usr/share/elasticsearch/config/elasticsearch.yml', 'ro': false } ] %}

{% include 'docker-run.sls-fragment' %}
