UPDATE builds
SET status = 'failed',
    error_message = 'Сборка была прервана из-за технического обслуживания сервера сборки. Пожалуйста, запустите сборку заново.',
    updated_at = NOW()
WHERE id = 17 AND status = 'building';