#############
# STATE TO LOAD FULL EXAMPLE DATA
#############

# The included states will be run in sequential order
include:
  - redef.elasticsearch
  - migration_old.reset
  - migration_old.issuing_rules_imported
  - migration_old.authorised_values_imported
  - migration_old.patrons_imported
  - migration_old.material_type_loaded
  - migration_old.redef_catalogue_loaded
  - migration_old.loans_loaded
  - migration_old.reservations_loaded
  - migration_old.cleanup
  - koha.reindexed
  - migration_old.redef_sparql_aggregation
  - redef.elasticsearch.mappings
  - migration_old.redef_index_all_works
  - migration_old.report
