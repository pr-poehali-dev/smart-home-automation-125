-- Выдаём пользователю Богдан (bislamgulov@inbox.ru) пожизненную подписку
INSERT INTO subscriptions (user_id, plan_code, status, builds_used, started_at, expires_at)
VALUES (6, 'lifetime', 'active', 0, NOW(), '2099-12-31 23:59:59');
