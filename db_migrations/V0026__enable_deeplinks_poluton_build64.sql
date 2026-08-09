UPDATE builds
SET config = jsonb_set(jsonb_set(config, '{deepLinks}', 'true'::jsonb), '{urlScheme}', '"poluton"'::jsonb)
WHERE id = 64;