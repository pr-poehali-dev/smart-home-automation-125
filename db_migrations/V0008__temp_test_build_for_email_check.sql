-- Тестовая сборка для проверки отправки письма
INSERT INTO builds (user_id, site_url, app_name, status)
VALUES (1, 'https://example.com', 'Тестовое приложение', 'building')
ON CONFLICT DO NOTHING;
