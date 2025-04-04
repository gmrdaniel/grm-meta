-- add enum type for meta verification status
DO $$ BEGIN
  CREATE TYPE meta_verification_status AS ENUM ('review', 'accepted', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- add new column to profiles table
ALTER TABLE public.profiles
ADD COLUMN meta_verified meta_verification_status DEFAULT 'review';
