INSERT IGNORE INTO borrower_attribute_types
  (code, description, unique_id, staff_searchable, authorised_value_category, class)
VALUES
  ('fnr', 'Fødselsnummer', 1, 1, NULL, 'fnr'),
  ('dooraccess', 'Meråpent tilgang', 0, 0, 'DOORACCESS', 'dooraccess');