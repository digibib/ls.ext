#############
# STATE TO LOAD FULL EXAMPLE DATA
#############

# The included states will be run in sequential order
include:
  - migration.reset
  - migration.issuing_rules_imported
  - migration.authorised_values_imported
  - migration.patrons_imported
  - migration.material_type_loaded
  - migration.redef_catalogue_loaded
  - migration.loans_loaded
  - migration.reservations_loaded
  - koha.reindexed
  - migration.report
