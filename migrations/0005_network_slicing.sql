-- Add Network Slicing and ensure NTN + Network Slicing are first-class technologies.

INSERT OR IGNORE INTO technologies
  (name, slug, full_name, description, intro_release, generation, key_specs, icon, spec_count)
VALUES
  (
    'NTN',
    'ntn',
    'Non-Terrestrial Networks',
    'Satellite and other non-terrestrial access for NR and IoT, covering transparent and regenerative payloads, feeder links, and NTN-capable UE/RAN procedures.',
    'Rel-17',
    '5G',
    'TS 38.300,TS 38.821,TS 23.501',
    '🛰️',
    0
  ),
  (
    'Network Slicing',
    'network-slicing',
    '5G Network Slicing',
    'End-to-end network slicing across RAN, transport, and 5GC — including S-NSSAI, NSSF, slice management, and slice-aware QoS/policy.',
    'Rel-15',
    '5G',
    'TS 23.501,TS 28.530,TS 28.531',
    '🍰',
    0
  );

UPDATE specs
SET technology = 'NTN'
WHERE title LIKE '%NTN%'
   OR title LIKE '%Non-Terrestrial%'
   OR title LIKE '%Non Terrestrial%'
   OR title LIKE '%satellite access%'
   OR title LIKE '%Satellite Access%';

UPDATE specs
SET technology = 'Network Slicing'
WHERE title LIKE '%network slicing%'
   OR title LIKE '%Network Slicing%'
   OR title LIKE '%Network Slice%'
   OR title LIKE '%S-NSSAI%'
   OR title LIKE '%NSSF%';

UPDATE technologies
SET spec_count = (SELECT COUNT(DISTINCT spec_id) FROM specs WHERE specs.technology = technologies.name);
