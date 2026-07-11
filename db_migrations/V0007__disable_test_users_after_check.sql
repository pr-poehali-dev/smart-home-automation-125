-- Помечаем тестовые аккаунты как неактивные (удалить вручную через интерфейс БД при желании)
UPDATE users SET password_hash = 'disabled', verification_code = NULL WHERE email LIKE 'test_smtp_check_%';
