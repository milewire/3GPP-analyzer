-- Purge remaining 2G/3G catalog material (GERAN/UTRAN series and pre-LTE releases).
-- Do not match titles containing "E-UTRAN" / EPC "GPRS Tunnelling" nomenclature.

DELETE FROM specs
WHERE series IN (
  '25',
  '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '55'
)
   OR technology IN ('UMTS', 'GPRS', 'GSM/EDGE')
   OR release IN ('R99', 'Rel-99', 'Rel-2', 'Rel-4', 'Rel-5', 'Rel-6', 'Rel-7')
   OR title LIKE '3G Security%'
   OR title LIKE 'GSM %'
   OR title LIKE '% GSM and %'
   OR title LIKE '% for GSM'
   OR title LIKE '% for GSM;%'
   OR title LIKE '%UMTS%'
   OR title LIKE '% WCDMA%'
   OR title LIKE 'UTRAN %'
   OR title LIKE '% UTRAN;%'
   OR title LIKE '%(UTRAN)%'
   OR title LIKE '%GERAN%'
   OR title LIKE '%GPRS);%'
   OR title LIKE 'General Packet Radio Service (GPRS);%';

DELETE FROM technologies
WHERE slug IN ('umts', 'gprs', 'gsm-edge')
   OR name IN ('UMTS', 'GPRS', 'GSM/EDGE')
   OR generation IN ('2G', '2.5G', '3G');

DELETE FROM releases
WHERE name IN ('R99', 'Rel-99', 'Rel-2', 'Rel-4', 'Rel-5', 'Rel-6', 'Rel-7');

UPDATE technologies
SET intro_release = 'Rel-8'
WHERE slug = 'ims' AND intro_release IN ('Rel-5', 'R99');

UPDATE releases
SET spec_count = (SELECT COUNT(*) FROM specs WHERE specs.release = releases.name);

UPDATE technologies
SET spec_count = (SELECT COUNT(DISTINCT spec_id) FROM specs WHERE specs.technology = technologies.name);
