-- Профиль: email-уведомления, реферальный код и кем приглашён
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(16) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by INTEGER REFERENCES users(id);

-- Заполняем реферальные коды существующим пользователям
UPDATE users SET referral_code = UPPER(SUBSTRING(MD5(id::text || random()::text), 1, 8)) WHERE referral_code IS NULL;

-- История начислений реферальных бонусов
CREATE TABLE IF NOT EXISTS referral_bonuses (
    id SERIAL PRIMARY KEY,
    referrer_id INTEGER NOT NULL REFERENCES users(id),
    referred_id INTEGER NOT NULL REFERENCES users(id),
    payment_id INTEGER NOT NULL REFERENCES payments(id),
    bonus_days INTEGER NOT NULL DEFAULT 7,
    status VARCHAR(20) NOT NULL DEFAULT 'granted',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_bonuses_referrer ON referral_bonuses(referrer_id);
