INSERT IGNORE INTO categories(categorycode, description, enrolmentperiod, enrolmentperioddate, upperagelimit, category_type)
VALUES
  ('API', 'API-user', NULL, NULL, '2999-01-01', 'S'),
  ('AUTO', 'Self checkout machines', NULL, NULL, '2999-01-01', 'S'),
  ('DOOR', 'Self service door access', NULL, NULL, '2999-01-01', 'S'),
  ('REGVOKSEN', 'Selvregistrert voksen', 1, NULL, NULL, 'A'),
  ('REGBARN', 'Selvregistrert barn', 1, NULL, 15, 'C');
