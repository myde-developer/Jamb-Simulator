-- ============================================
-- VERIFICATION FUNCTION
-- Run this after importing all data to verify counts
-- ============================================

-- Create verification function
CREATE OR REPLACE FUNCTION get_question_counts() 
RETURNS TABLE(subject_name VARCHAR, total_questions BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT s.name, COUNT(q.id)
    FROM subjects s
    LEFT JOIN questions q ON s.id = q.subject_id
    GROUP BY s.id, s.name
    ORDER BY s.name;
END;
$$ LANGUAGE plpgsql;

-- Run verification
SELECT * FROM get_question_counts();

-- Expected output:
--  Use of English | 300
--  Mathematics    | 200
--  Physics        | 200
--  Chemistry      | 200
--  Biology        | 200