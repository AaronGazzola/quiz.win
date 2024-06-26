-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the profile table
CREATE TABLE public.profile (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID,
    username TEXT,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security (RLS) for the profile table
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow anyone to insert a profile
CREATE POLICY "Allow anyone to insert a profile"
ON public.profile
FOR INSERT
WITH CHECK (true);

-- Create a policy to allow users to update their own profile
CREATE POLICY "Allow users to update their own profile"
ON public.profile
FOR UPDATE
USING (auth.uid() = user_id);

-- Add RLS function to enforce policies
CREATE OR REPLACE FUNCTION enforce_rls() RETURNS trigger AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        -- Ensure the user can only update their own profile
        IF (NEW.user_id != auth.uid()) THEN
            RAISE EXCEPTION 'Permission denied';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach the RLS function to the profile table
CREATE TRIGGER enforce_rls
BEFORE UPDATE ON public.profile
FOR EACH ROW EXECUTE FUNCTION enforce_rls();
