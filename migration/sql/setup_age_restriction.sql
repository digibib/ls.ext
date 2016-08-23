UPDATE marc_subfield_structure
SET kohafield = 'biblioitems.agerestriction'
WHERE tagfield = '521'  AND tagsubfield = 'a';
