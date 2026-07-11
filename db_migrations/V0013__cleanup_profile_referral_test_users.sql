-- Деактивация тестовых аккаунтов, созданных при проверке профиля/рефералов
UPDATE users SET password_hash = 'disabled' WHERE id IN (7, 8);
