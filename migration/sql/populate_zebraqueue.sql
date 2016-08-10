TRUNCATE TABLE zebraqueue;
INSERT INTO zebraqueue (biblio_auth_number, operation, server)
SELECT biblionumber, 'specialUpdate', 'biblioserver' FROM biblioitems;