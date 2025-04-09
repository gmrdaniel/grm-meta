-- Enum for type/category of notification
create type notification_types as enum (
  'reminder',
  'notification',
  'alert'
);