CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS builds (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    site_url VARCHAR(500) NOT NULL,
    app_name VARCHAR(255) NOT NULL,
    package_name VARCHAR(255),
    icon_url TEXT,
    splash_color VARCHAR(20) DEFAULT '#000000',
    theme_color VARCHAR(20) DEFAULT '#ef4444',
    push_enabled BOOLEAN NOT NULL DEFAULT false,
    offline_enabled BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(50) NOT NULL DEFAULT 'queued',
    apk_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_builds_user_id ON builds(user_id);
