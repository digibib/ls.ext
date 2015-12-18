# MIGRATE AND IMPORT PARTONS

{% from "migration-new/migration-docker-run-command.sls-fragment" import migration with context %}

{{ migration("convert_patrons", { "docker_cmd": "convert_data.sh" }) }}
{{ migration("prepare_patrons_csv", { "docker_cmd": "prepare_csv.sh" }) }}
{{ migration("prepare_patrons_for_import", { "docker_cmd": "prepare_import.sh" }) }}
{{ migration("import_patrons", {"mysql_import": {"file":"/migration/sql/import_patrons.sql"} }) }}
{{ migration("prepare_patrons_permissions", { "docker_cmd": "grant_permissions.sh" }) }}
{{ migration("update_patron_flags", {"mysql_import": {"file":"/migration/sql/update_flags.sql"} }) }}
