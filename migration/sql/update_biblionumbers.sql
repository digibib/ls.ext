SET foreign_key_checks=0;
START TRANSACTION;

UPDATE items SET
  biblionumber = CONVERT(SUBSTRING(barcode, 5, 7), SIGNED INTEGER),
  biblioitemnumber = biblionumber;

ALTER TABLE biblio MODIFY biblionumber INT(11) NOT NULL;
ALTER TABLE biblio DROP PRIMARY KEY;

UPDATE biblio
  SET biblionumber =
    (SELECT ExtractValue(biblioitems.marcxml, '//controlfield[@tag="001"]')
    FROM biblioitems
    WHERE biblio.biblionumber=biblioitems.biblionumber
    ORDER BY biblionumber DESC)
;
ALTER TABLE biblio MODIFY biblionumber INT(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE biblio ADD PRIMARY KEY (biblionumber);

ALTER TABLE biblioitems MODIFY biblioitemnumber INT(11) NOT NULL;
ALTER TABLE biblioitems DROP PRIMARY KEY;

UPDATE biblioitems
  SET biblionumber =
    (SELECT ExtractValue(biblioitems.marcxml, '//controlfield[@tag="001"]'))
    ORDER BY biblionumber DESC
;

UPDATE biblioitems
SET biblioitemnumber = biblionumber;

ALTER TABLE biblioitems MODIFY biblioitemnumber INT(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE biblioitems ADD PRIMARY KEY (biblioitemnumber);

COMMIT;
SET foreign_key_checks=1;
