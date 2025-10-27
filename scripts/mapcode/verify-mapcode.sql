-- ===================================================================
-- MapCode Verification SQL Script
-- Verify MapCode import và test compatibility
-- ===================================================================

\echo '============================================================'
\echo 'MapCode Import Verification'
\echo '============================================================'
\echo ''

-- 1. Kiểm tra version đã import
\echo '1. Check MapCode Versions:'
\echo '-----------------------------------------------------------'
SELECT 
    id,
    version,
    name,
    is_active,
    created_by,
    created_at,
    file_path
FROM mapcode_versions
ORDER BY created_at DESC
LIMIT 5;

\echo ''
\echo '2. Active Version Details:'
\echo '-----------------------------------------------------------'
SELECT 
    id,
    version,
    name,
    description,
    is_active,
    created_at
FROM mapcode_versions
WHERE is_active = true;

\echo ''
\echo '3. Storage Information:'
\echo '-----------------------------------------------------------'
SELECT 
    COUNT(*) as total_versions,
    20 as max_versions,
    20 - COUNT(*) as available_slots,
    CASE 
        WHEN COUNT(*) >= 18 THEN 'WARNING: Near limit'
        WHEN COUNT(*) >= 20 THEN 'ERROR: At limit'
        ELSE 'OK'
    END as status
FROM mapcode_versions;

\echo ''
\echo '4. Translation Cache Statistics:'
\echo '-----------------------------------------------------------'
SELECT 
    version_id,
    COUNT(*) as cached_translations,
    COUNT(DISTINCT grade) as unique_grades,
    COUNT(DISTINCT subject) as unique_subjects,
    COUNT(DISTINCT chapter) as unique_chapters,
    COUNT(DISTINCT level) as unique_levels
FROM mapcode_translations
GROUP BY version_id
ORDER BY COUNT(*) DESC
LIMIT 5;

\echo ''
\echo '5. Sample Translations (if any):'
\echo '-----------------------------------------------------------'
SELECT 
    question_code,
    translation,
    grade,
    subject,
    chapter,
    level,
    lesson
FROM mapcode_translations
LIMIT 10;

\echo ''
\echo '============================================================'
\echo 'Verification Complete!'
\echo '============================================================'

