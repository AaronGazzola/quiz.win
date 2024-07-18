-- Create sessions table to track user activities before signup
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Grant permissions on the sessions table and associated objects
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.sessions TO anon;
ALTER TABLE public.sessions DISABLE ROW LEVEL SECURITY;