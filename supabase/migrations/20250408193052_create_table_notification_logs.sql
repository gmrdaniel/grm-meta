create table notification_logs (
  id uuid primary key default gen_random_uuid(),

  channel notification_channel not null,         -- Channel used to send notification
  status notification_status not null,           -- 'sent', 'failed', or 'pending'
  error_message text,                            -- Error info if applicable
  sent_at timestamp default now(),               -- Timestamp of the send attempt

  invitation_id uuid not null references creator_invitations(id) on delete cascade,
  notification_setting_id uuid not null references notification_settings(id) on delete set null,
  stage_id uuid references project_stages(id) on delete set null -- Redundant for ease of analytics
);

-- Indexes
create index idx_notification_logs_invitation_setting
on notification_logs (invitation_id, notification_setting_id);

create index idx_notification_logs_invitation_stage
on notification_logs (invitation_id, stage_id, channel);
