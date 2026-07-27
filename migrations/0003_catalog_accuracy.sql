-- Keep the live catalog scope explicit: fully ingested releases only.
DELETE FROM specs
WHERE release NOT IN ('Rel-15', 'Rel-16', 'Rel-17', 'Rel-18', 'Rel-19', 'Rel-20');

DELETE FROM releases
WHERE name NOT IN ('Rel-15', 'Rel-16', 'Rel-17', 'Rel-18', 'Rel-19', 'Rel-20');

INSERT OR IGNORE INTO technologies
  (name, slug, full_name, description, intro_release, generation, key_specs, icon, spec_count)
VALUES
  ('3GPP System', '3gpp-system', '3GPP System and Programme Management', 'Cross-system requirements, specification management, working methods, and programme-level documents.', 'Rel-15', 'All', 'TS 21.101,TR 21.900', '📋', 0),
  ('3GPP Services', '3gpp-services', '3GPP Service Requirements', 'Stage 1 service requirements and service-level capabilities spanning radio and core generations.', 'Rel-15', 'All', 'TS 22.101,TS 22.261', '📌', 0),
  ('Codecs & Media', 'codecs-media', '3GPP Codecs and Media', 'Speech, audio, video, and multimedia codec specifications and media handling.', 'Rel-15', 'All', 'TS 26.114,TS 26.445', '🎬', 0),
  ('Data Services', 'data-services', '3GPP Data Services', 'Data applications, terminal data functions, and related service specifications.', 'Rel-15', 'All', NULL, '📦', 0),
  ('OAM & Charging', 'oam-charging', 'Operations, Administration, Maintenance and Charging', 'Network management, orchestration, charging, performance, configuration, and resource models.', 'Rel-15', 'All', 'TS 28.541,TS 32.240', '📊', 0),
  ('UICC & Smart Cards', 'uicc-smart-cards', 'UICC, USIM and Smart Cards', 'Subscriber identity modules, integrated circuit cards, application toolkits, and associated tests.', 'Rel-15', 'All', 'TS 31.102', '💳', 0),
  ('Conformance Testing', 'conformance-testing', 'UE and USIM Conformance Testing', 'Conformance and interoperability test specifications for user equipment and subscriber identity modules.', 'Rel-15', 'All', NULL, '🧪', 0),
  ('Multi-RAT', 'multi-rat', 'Multiple Radio Access Technologies', 'Specifications spanning multiple radio access technologies and shared-spectrum functions.', 'Rel-15', 'All', 'TS 37.213,TS 37.340', '🔀', 0);

UPDATE specs
SET technology = CASE
      WHEN series IN ('21', '30') THEN '3GPP System'
      WHEN series = '22' THEN '3GPP Services'
      WHEN series = '26' THEN 'Codecs & Media'
      WHEN series = '27' THEN 'Data Services'
      WHEN series IN ('28', '32') THEN 'OAM & Charging'
      WHEN series = '31' THEN 'UICC & Smart Cards'
      WHEN series = '34' THEN 'Conformance Testing'
      WHEN series = '37' THEN 'Multi-RAT'
      WHEN series IN ('33', '35') THEN 'Security'
      ELSE technology
    END,
    category = CASE
      WHEN series IN ('21', '30') THEN 'General'
      WHEN series = '22' THEN 'Service'
      WHEN series = '26' THEN 'Codecs & Media'
      WHEN series = '27' THEN 'Data'
      WHEN series IN ('28', '32') THEN 'Management'
      WHEN series = '31' THEN 'Subscriber Identity'
      WHEN series = '34' THEN 'Conformance Testing'
      WHEN series IN ('33', '35') THEN 'Security'
      ELSE category
    END,
    network_layer = CASE
      WHEN series IN ('21', '30') THEN 'General'
      WHEN series = '22' THEN 'Service'
      WHEN series = '26' THEN 'Media'
      WHEN series = '27' THEN 'Data'
      WHEN series IN ('28', '32') THEN 'Management'
      WHEN series = '31' THEN 'Subscriber Identity'
      WHEN series = '34' THEN 'Testing'
      WHEN series IN ('33', '35') THEN 'Security'
      ELSE network_layer
    END;

-- Drop discontinued GERAN / UTRAN series from the live Rel-15+ catalog.
DELETE FROM specs
WHERE series IN (
  '25',
  '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '55'
)
   OR technology IN ('UMTS', 'GPRS', 'GSM/EDGE');

DELETE FROM technologies
WHERE slug IN ('umts', 'gprs', 'gsm-edge')
   OR name IN ('UMTS', 'GPRS', 'GSM/EDGE');

UPDATE releases
SET spec_count = (SELECT COUNT(*) FROM specs WHERE specs.release = releases.name);

UPDATE technologies
SET spec_count = (SELECT COUNT(DISTINCT spec_id) FROM specs WHERE specs.technology = technologies.name);
