-- Database'ni to'liq tozalash
-- Barcha tabllarni o'chirish (agar mavjud bo'lsa)
DROP TABLE IF EXISTS user_results CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS question_templates CASCADE;
DROP TABLE IF EXISTS answers CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS templates CASCADE;

-- Barcha sequence'larni o'chirish (agar mavjud bo'lsa)
DROP SEQUENCE IF EXISTS user_results_id_seq CASCADE;
DROP SEQUENCE IF EXISTS users_id_seq CASCADE;
DROP SEQUENCE IF EXISTS answers_id_seq CASCADE;
DROP SEQUENCE IF EXISTS questions_id_seq CASCADE;
DROP SEQUENCE IF EXISTS categories_id_seq CASCADE;
DROP SEQUENCE IF EXISTS templates_id_seq CASCADE;

-- TypeORM migration table'ni ham tozalash
DROP TABLE IF EXISTS typeorm_metadata CASCADE;
DROP TABLE IF EXISTS migrations CASCADE;

-- Natija
SELECT 'Database tozalandi!' as result;
