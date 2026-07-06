-- Email-верификация при регистрации
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code_expires TIMESTAMP;

-- Тарифные планы
CREATE TABLE IF NOT EXISTS plans (
    code VARCHAR(30) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price INTEGER NOT NULL,
    builds_limit INTEGER,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0
);

INSERT INTO plans (code, name, price, builds_limit, description, sort_order) VALUES
    ('start', 'Старт', 990, 1, 'Идеально для первого запуска: 1 сборка APK в месяц', 1),
    ('pro', 'Про', 2990, 5, '5 сборок в месяц и все premium-дополнения', 2),
    ('business', 'Бизнес', 6990, NULL, 'Безлимитные сборки и приоритетная поддержка', 3)
ON CONFLICT (code) DO NOTHING;

-- Подписки пользователей на тариф
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    plan_code VARCHAR(30) NOT NULL REFERENCES plans(code),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    builds_used INTEGER NOT NULL DEFAULT 0,
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- Платежи через ЮKassa
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    plan_code VARCHAR(30) NOT NULL REFERENCES plans(code),
    amount INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    yookassa_payment_id VARCHAR(100),
    confirmation_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    paid_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_yookassa_id ON payments(yookassa_payment_id);
