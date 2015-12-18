#############
# STATE TO LOAD FULL EXAMPLE DATA
#############

# The included states will be run in sequential order
include:
  - migration_old.reset
  - migration_old.issuing_rules_imported
  - migration_old.authorised_values_imported
  - migration_old.patrons_imported
  - migration_old.material_type_loaded
  - migration_old.catalogue_loaded
  - migration_old.loans_loaded
  - migration_old.reservations_loaded
  - migration_old.cleanup
  - koha.reindexed
  - migration_old.report
