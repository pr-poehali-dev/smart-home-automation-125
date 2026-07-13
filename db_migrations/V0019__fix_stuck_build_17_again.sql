UPDATE builds
SET status = 'failed',
    error_message = 'Сборка не завершилась вовремя — сервер сборки прекратил обработку без ответа. Требуется проверить логи сервера сборки.',
    updated_at = NOW()
WHERE id = 17 AND status = 'building';