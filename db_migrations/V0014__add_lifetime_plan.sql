-- Добавляем пожизненный тариф (безлимитные сборки, не отображается в публичном прайсинге)
INSERT INTO plans (code, name, price, builds_limit, description, sort_order)
VALUES ('lifetime', 'Пожизненный', 0, NULL, 'Специальный пожизненный доступ с безлимитными сборками', 999)
ON CONFLICT (code) DO NOTHING;
