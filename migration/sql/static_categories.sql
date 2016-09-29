INSERT IGNORE INTO categories(categorycode, description, enrolmentperiod, enrolmentperioddate, upperagelimit, category_type)
VALUES
  ('API', 'API-user', NULL, NULL, '2999-01-01', 'S'),
  ('AUTO', 'Selvbetjeningsautomat', NULL, NULL, '2999-01-01', 'S'),
  ('DOOR', 'Meråpent dørterminal', NULL, NULL, '2999-01-01', 'S'),
  ('REGVOKSEN', 'Selvregistrert voksen', 1, NULL, NULL, 'A'),
  ('REGBARN', 'Selvregistrert barn', 1, NULL, 15, 'C'),
  ('ADMIN', 'Administrator', NULL, NULL, '2999-01-01', 'S'),
  ('ANS','Ansatt', NULL, NULL, '2999-01-01', 'S'),
  ('B','Barn', NULL, NULL, '2999-01-01', 'C'),
  ('BHG','Barnehage', NULL, NULL, '2999-01-01', 'I'),
  ('BIB','Bibliotek', NULL, NULL, '2999-01-01', 'I'),
  ('I','Institusjon', NULL, NULL, '2999-01-01', 'I'),
  ('KL','Klasselåner', NULL, NULL, '2999-01-01', 'P'),
  ('MDL','Midlertidig bosatt', NULL, NULL, '2999-01-01', 'A'),
  ('PAS','Pasient', NULL, NULL, '2999-01-01', 'A'),
  ('SKO','Skole', NULL, NULL, '2999-01-01', 'I'),
  ('V','Voksen', NULL, NULL, '2999-01-01', 'A');
