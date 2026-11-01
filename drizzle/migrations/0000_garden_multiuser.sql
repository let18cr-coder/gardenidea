CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.notebooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  cover text NOT NULL DEFAULT 'rosa',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notebooks TO authenticated;
GRANT ALL ON public.notebooks TO service_role;
ALTER TABLE public.notebooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notebooks select" ON public.notebooks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own notebooks insert" ON public.notebooks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own notebooks update" ON public.notebooks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own notebooks delete" ON public.notebooks FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  notebook_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  stage text NOT NULL DEFAULT 'semilla' CHECK (stage IN ('semilla','brote','planta','flor')),
  tags text[] NOT NULL DEFAULT '{}',
  link text,
  image text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (notebook_id, user_id) REFERENCES public.notebooks(id, user_id) ON DELETE CASCADE
);
CREATE INDEX ideas_user_idx ON public.ideas(user_id);
CREATE INDEX ideas_notebook_idx ON public.ideas(notebook_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ideas TO authenticated;
GRANT ALL ON public.ideas TO service_role;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own ideas select" ON public.ideas FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own ideas insert" ON public.ideas FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own ideas update" ON public.ideas FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own ideas delete" ON public.ideas FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER ideas_touch BEFORE UPDATE ON public.ideas FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();