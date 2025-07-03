-- Create a new enum type for correction reasons
CREATE TYPE fixing_reason AS ENUM ('profile', 'page', 'other');

-- Create the invitation_fixing table
CREATE TABLE public.invitation_fixing ( 
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
   
   -- Reference to the invitation that needs correction 
   invitation_id UUID NOT NULL REFERENCES public.creator_invitations(id) ON DELETE CASCADE, 
   
   -- Reason for correction (using enum type)
   reason  fixing_reason NOT NULL, 
   
   -- Detailed description of the problem 
   description TEXT, 
   
   -- Correction status 
   is_fixed BOOLEAN DEFAULT FALSE, 
   
   -- Important dates 
   created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
   fixed_at TIMESTAMP WITH TIME ZONE 
); 
 
-- Security policies 
ALTER TABLE public.invitation_fixing ENABLE ROW LEVEL SECURITY; 
 
-- Policy for administrators (can view and modify everything) 
CREATE POLICY admin_all ON public.invitation_fixing 
  FOR ALL 
  TO authenticated 
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));