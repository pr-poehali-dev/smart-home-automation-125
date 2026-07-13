INSERT INTO t_p27322684_smart_home_automatio.builds (id, user_id, site_url, app_name, package_name, status)
VALUES (15, 6, 'https://xn----utbhbbdxh.xn--p1ai/', 'Полутон', 'com.poluton.app', 'building')
ON CONFLICT (id) DO NOTHING;
SELECT setval('t_p27322684_smart_home_automatio.builds_id_seq', (SELECT MAX(id) FROM t_p27322684_smart_home_automatio.builds));