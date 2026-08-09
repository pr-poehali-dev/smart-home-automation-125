UPDATE builds
SET config = jsonb_set(config, '{urlScheme}', '"poluton"'::jsonb)
WHERE id = 66 AND (config->>'urlScheme' IS NULL OR config->>'urlScheme' = '');