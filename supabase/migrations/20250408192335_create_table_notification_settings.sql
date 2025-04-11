create table notification_settings (
  id uuid primary key default gen_random_uuid(),

  type notification_types not null,          -- Type/category of notification
  subject text,                              -- Optional subject for email notifications
  message text not null,                     -- Message body with optional placeholders
  channel notification_channel not null,     -- e.g., 'email', 'sms'
  enabled boolean not null default false,     -- If false, this config is ignored
  delay_days integer not null default 0,     -- Minimum days before first notification after entering the stage
  frequency_days integer not null default 0, -- Minimum days between repeated notifications
  max_notifications integer not null default 0, -- Maximum number of notification attempts

  stage_id uuid references project_stages(id) on delete cascade,
  created_at timestamp default now()
);

-- as long as they are for different delay_days
create unique index unique_stage_channel_delay_notification
on notification_settings (stage_id, channel, delay_days);
