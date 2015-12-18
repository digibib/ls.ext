# KOHA IMPORT OF CONFIGURATION DATA
{% from "migration/migration-docker-run-command.sls-fragment" import migration with context %}

{{ migration("branches", {"mysql_import": {"file":"/migration/sql/branches.sql"} }) }}
{{ migration("patron_categories", {"mysql_import": {"file":"/migration/sql/patron_categories.sql"} }) }}
{{ migration("authorised_values", {"mysql_import": {"file":"/migration/sql/authorised_values.sql"} }) }}
{{ migration("issuing_rules", {"mysql_import": {"file":"/migration/sql/issuing_rules.sql"} }) }}
{{ migration("item_types", {"mysql_import": {"file":"/migration/sql/item_types.sql"} }) }}
