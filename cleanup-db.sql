-- Bazani tozalash uchun SQL skript
-- Bu skriptni ishga tushirish: psql -U postgres -d yangi -f cleanup-db.sql

-- 1. Barcha jadvallarni tozalash
TRUNCATE TABLE question_templates CASCADE;
TRUNCATE TABLE questions CASCADE;
TRUNCATE TABLE categories CASCADE;
TRUNCATE TABLE templates CASCADE;
TRUNCATE TABLE answers CASCADE;

-- 2. Auto-increment larni qayta boshlash
ALTER SEQUENCE questions_id_seq RESTART WITH 1;
ALTER SEQUENCE categories_id_seq RESTART WITH 1;
ALTER SEQUENCE templates_id_seq RESTART WITH 1;
ALTER SEQUENCE answers_id_seq RESTART WITH 1;

-- 3. Natija
SELECT 'Baza tozalandi!' as result;
