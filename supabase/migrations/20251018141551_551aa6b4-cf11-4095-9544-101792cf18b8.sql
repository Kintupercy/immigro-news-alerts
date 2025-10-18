-- ============================================
-- PHASE 1B: ENABLE RLS ON CONTENT TABLES
-- Fix remaining RLS policy warnings
-- ============================================

-- Enable RLS on blog_articles (has existing policy but RLS was disabled)
ALTER TABLE public.blog_articles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on immigration_news (has existing policy but RLS was disabled)
ALTER TABLE public.immigration_news ENABLE ROW LEVEL SECURITY;

-- Enable RLS on immigration_categories (has existing policy but RLS was disabled)
ALTER TABLE public.immigration_categories ENABLE ROW LEVEL SECURITY;

-- Note: These tables already have SELECT policies allowing public access to published content
-- No additional policies needed - existing policies will work once RLS is enabled