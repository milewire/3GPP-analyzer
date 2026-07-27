-- Ensure every technology card has an icon.

UPDATE technologies SET icon = '📋' WHERE slug = '3gpp-system' AND (icon IS NULL OR icon = '');
UPDATE technologies SET icon = '📌' WHERE slug = '3gpp-services' AND (icon IS NULL OR icon = '');
UPDATE technologies SET icon = '🎬' WHERE slug = 'codecs-media' AND (icon IS NULL OR icon = '');
UPDATE technologies SET icon = '📦' WHERE slug = 'data-services' AND (icon IS NULL OR icon = '');
UPDATE technologies SET icon = '📊' WHERE slug = 'oam-charging' AND (icon IS NULL OR icon = '');
UPDATE technologies SET icon = '💳' WHERE slug = 'uicc-smart-cards' AND (icon IS NULL OR icon = '');
UPDATE technologies SET icon = '🧪' WHERE slug = 'conformance-testing' AND (icon IS NULL OR icon = '');
UPDATE technologies SET icon = '🔀' WHERE slug = 'multi-rat' AND (icon IS NULL OR icon = '');
UPDATE technologies SET icon = '🛰️' WHERE slug = 'ntn' AND (icon IS NULL OR icon = '');
UPDATE technologies SET icon = '🍰' WHERE slug = 'network-slicing' AND (icon IS NULL OR icon = '');
UPDATE technologies SET icon = '📶' WHERE slug = 'lte' AND (icon IS NULL OR icon = '');
UPDATE technologies SET icon = '📡' WHERE slug = 'lte-advanced' AND (icon IS NULL OR icon = '');
UPDATE technologies SET icon = '🚀' WHERE slug = 'lte-advanced-pro' AND (icon IS NULL OR icon = '');
UPDATE technologies SET icon = '🌐' WHERE slug = '5g' AND (icon IS NULL OR icon = '');
UPDATE technologies SET icon = '⚡' WHERE slug = '5g-advanced' AND (icon IS NULL OR icon = '');
UPDATE technologies SET icon = '☎️' WHERE slug = 'ims' AND (icon IS NULL OR icon = '');
UPDATE technologies SET icon = '🧩' WHERE slug = 'epc' AND (icon IS NULL OR icon = '');
UPDATE technologies SET icon = '🔒' WHERE slug = 'security' AND (icon IS NULL OR icon = '');
UPDATE technologies SET icon = '🧠' WHERE slug = '5gc' AND (icon IS NULL OR icon = '');
UPDATE technologies SET icon = '🎙️' WHERE slug = 'volte' AND (icon IS NULL OR icon = '');
