-- Create missing tables that the code references

-- 1. Create notification_settings table (referenced in CampaignStats.tsx and EventInvitation.tsx)
CREATE TABLE IF NOT EXISTS public.notification_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT false,
    channel TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    delay_days INTEGER NOT NULL DEFAULT 0,
    frequency_days INTEGER NOT NULL DEFAULT 0,
    max_notifications INTEGER NOT NULL DEFAULT 0,
    stage_id UUID REFERENCES public.project_stages(id),
    target_status TEXT,
    template_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Create invitation_events table (referenced in CreateEvent.tsx and EventInvitation.tsx)  
CREATE TABLE IF NOT EXISTS public.invitation_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    id_project UUID NOT NULL REFERENCES public.projects(id),
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    max_participants INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id)
);

-- 3. Create country_phone_codes table (referenced in functions)
CREATE TABLE IF NOT EXISTS public.country_phone_codes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name_es VARCHAR NOT NULL,
    name_en VARCHAR NOT NULL,
    phone_code VARCHAR NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_phone_codes ENABLE ROW LEVEL SECURITY;

-- RLS policies for notification_settings
CREATE POLICY "Admins can manage notification settings" ON public.notification_settings
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- RLS policies for invitation_events
CREATE POLICY "Admins can manage invitation events" ON public.invitation_events
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Anyone can read invitation events" ON public.invitation_events
FOR SELECT USING (true);

-- RLS policies for country_phone_codes
CREATE POLICY "Anyone can read country phone codes" ON public.country_phone_codes
FOR SELECT USING (true);

CREATE POLICY "Admins can manage country phone codes" ON public.country_phone_codes
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);