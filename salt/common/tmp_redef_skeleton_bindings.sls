##########
# TEMPORARY PLACEHOLDER: Redef skeleton bindings
##########

{% set catalinker_host_volume_bindings = [
 { 'host': '/vagrant/redef/catalinker/client', 'container': '/usr/src/app/client', 'ro': false },
 { 'host': '/vagrant/redef/catalinker/module-test', 'container': '/usr/src/app/module-test', 'ro': false },
 { 'host': '/vagrant/redef/catalinker/public', 'container': '/usr/src/app/public', 'ro': false }]
%}

{% set patron_client_host_volume_bindings = [
 { 'host': '/vagrant/redef/patron-client/client', 'container': '/usr/src/app/client', 'ro': false },
 { 'host': '/vagrant/redef/patron-client/public', 'container': '/usr/src/app/public', 'ro': false },
 { 'host': '/vagrant/redef/patron-client/module-test', 'container': '/usr/src/app/module-test', 'ro': false },
 { 'host': '/vagrant/redef/patron-client/test', 'container': '/usr/src/app/test', 'ro': false }]
%}