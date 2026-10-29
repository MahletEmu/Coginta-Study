-- ==============================================================================
-- COGNITA AI STUDY ASSISTANT - STAGE 4 COMPLETE DATABASE MIGRATION
-- ==============================================================================
-- Tables:
--   1. profiles (linked to auth.users)
--   2. study_materials (document metadata & storage link)
--   3. chat_sessions & chat_messages (persisted AI study discussions)
--   4. document_summaries (AI-generated structured document syntheses)
--   5. quizzes, quiz_questions, quiz_attempts (AI and custom recall quizzes)
--   6. study_tasks (planner tasks and progress tracking)
--   7. Supabase Storage bucket 'study-documents' and storage RLS policies
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. USER PROFILES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  major TEXT DEFAULT 'High School & College Prep',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-create profile trigger on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 3. STUDY MATERIALS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.study_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT 'General',
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'txt', 'docx', 'markdown')),
  file_size BIGINT NOT NULL CHECK (file_size > 0),
  page_count INTEGER,
  storage_path TEXT, -- path in 'study-documents' bucket
  status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('ready', 'processing', 'indexing', 'error')),
  sample_content TEXT,
  summary_preview TEXT,
  key_topics TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Materials RLS
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own materials"
  ON public.study_materials FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own materials"
  ON public.study_materials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own materials"
  ON public.study_materials FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own materials"
  ON public.study_materials FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_study_materials_user ON public.study_materials(user_id);
CREATE INDEX IF NOT EXISTS idx_study_materials_created ON public.study_materials(created_at DESC);

-- ==============================================================================
-- 4. CHAT SESSIONS & MESSAGES TABLES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Study Discussion',
  material_id UUID REFERENCES public.study_materials(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own chat sessions"
  ON public.chat_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat sessions"
  ON public.chat_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat sessions"
  ON public.chat_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat sessions"
  ON public.chat_sessions FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON public.chat_sessions(user_id);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  grounded_in_document BOOLEAN DEFAULT false,
  material_title TEXT,
  suggested_follow_ups JSONB DEFAULT '[]'::jsonb,
  is_error BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own chat messages"
  ON public.chat_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat messages"
  ON public.chat_messages FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON public.chat_messages(created_at ASC);

-- ==============================================================================
-- 5. DOCUMENT SUMMARIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.document_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id UUID REFERENCES public.study_materials(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT,
  overview TEXT NOT NULL,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  key_definitions JSONB NOT NULL DEFAULT '[]'::jsonb,
  takeaways JSONB NOT NULL DEFAULT '[]'::jsonb,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.document_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own document summaries"
  ON public.document_summaries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own document summaries"
  ON public.document_summaries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own document summaries"
  ON public.document_summaries FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_document_summaries_material ON public.document_summaries(material_id);
CREATE INDEX IF NOT EXISTS idx_document_summaries_user ON public.document_summaries(user_id);

-- ==============================================================================
-- 6. QUIZZES, QUESTIONS, AND ATTEMPTS TABLES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id UUID REFERENCES public.study_materials(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT 'General',
  description TEXT,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  time_limit_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own quizzes"
  ON public.quizzes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quizzes"
  ON public.quizzes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own quizzes"
  ON public.quizzes FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_quizzes_user ON public.quizzes(user_id);

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer_index INTEGER NOT NULL CHECK (correct_answer_index >= 0 AND correct_answer_index <= 3),
  explanation TEXT,
  topic TEXT,
  sort_order INTEGER DEFAULT 0
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own quiz questions"
  ON public.quiz_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes
      WHERE quizzes.id = quiz_questions.quiz_id
      AND quizzes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own quiz questions"
  ON public.quiz_questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quizzes
      WHERE quizzes.id = quiz_questions.quiz_id
      AND quizzes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own quiz questions"
  ON public.quiz_questions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes
      WHERE quizzes.id = quiz_questions.quiz_id
      AND quizzes.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON public.quiz_questions(quiz_id);

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  user_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own quiz attempts"
  ON public.quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz attempts"
  ON public.quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz ON public.quiz_attempts(quiz_id);

-- ==============================================================================
-- 7. STUDY TASKS TABLE (PLANNER)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.study_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT 'General',
  due_date DATE NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  completed BOOLEAN NOT NULL DEFAULT false,
  estimated_minutes INTEGER NOT NULL DEFAULT 30,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.study_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own study tasks"
  ON public.study_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study tasks"
  ON public.study_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study tasks"
  ON public.study_tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own study tasks"
  ON public.study_tasks FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_study_tasks_user ON public.study_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_study_tasks_due ON public.study_tasks(due_date ASC);

-- ==============================================================================
-- 8. SUPABASE STORAGE BUCKET & POLICIES ('study-documents')
-- ==============================================================================
-- Create the private bucket if it doesn't already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'study-documents',
  'study-documents',
  false,
  20971520, -- 20MB limit
  ARRAY['application/pdf', 'text/plain', 'text/markdown']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY['application/pdf', 'text/plain', 'text/markdown'];

-- Storage RLS: Users can only upload, read, and delete within their own folder:
-- path format: <user_id>/<file_name>
CREATE POLICY "Users can read own study documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'study-documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can upload own study documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'study-documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own study documents"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'study-documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own study documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'study-documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
