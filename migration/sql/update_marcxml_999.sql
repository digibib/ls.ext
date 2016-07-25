START TRANSACTION;
UPDATE biblioitems
SET marcxml = UpdateXML(marcxml, '//datafield[@tag="999"]/subfield[@code="c"]', CONCAT('<subfield code="c">', biblioitemnumber, '</subfield>'));

UPDATE biblioitems
SET marcxml = UpdateXML(marcxml, '//datafield[@tag="999"]/subfield[@code="d"]', CONCAT('<subfield code="d">', biblioitemnumber, '</subfield>'));
COMMIT;