UPDATE builds
SET config = jsonb_set(jsonb_set(config, '{urlScheme}', '"poluton"'::jsonb), '{internalExternalLinks}', 'true'::jsonb)
WHERE id = 69;