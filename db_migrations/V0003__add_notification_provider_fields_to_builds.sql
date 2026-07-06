ALTER TABLE builds
    ADD COLUMN IF NOT EXISTS push_provider VARCHAR(20) NOT NULL DEFAULT 'firebase',
    ADD COLUMN IF NOT EXISTS fcm_server_key TEXT,
    ADD COLUMN IF NOT EXISTS onesignal_app_id VARCHAR(100),
    ADD COLUMN IF NOT EXISTS onesignal_rest_api_key TEXT,
    ADD COLUMN IF NOT EXISTS notification_icon_set VARCHAR(50) DEFAULT 'lucide',
    ADD COLUMN IF NOT EXISTS notification_icon_name VARCHAR(100) DEFAULT 'Bell';
