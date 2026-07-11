-- Деактивация тестового аккаунта и тестовой сборки после проверки email-уведомлений
UPDATE users SET password_hash = 'disabled' WHERE email = 'test_mail_check_1783763017@yandex.ru';
UPDATE builds SET status = 'failed', error_message = 'test cleanup' WHERE id = 9 AND app_name = 'Тестовое приложение';
