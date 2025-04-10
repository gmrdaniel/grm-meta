INSERT INTO public.notification_settings (
  id, type, subject, message, channel, enabled, delay_days, frequency_days,
  max_notifications, stage_id, created_at, template_id
) VALUES (
  '1032be52-2938-4924-8d41-3074cf42dc8f', 'reminder', 'Your spot is reserved! Finish onboarding', $$ Hi {full_name},<br><br>Your spot is still reserved!<br><br>Click <a href="{{url}}">here</a> to complete your onboarding.<br><br>Looking forward to having you in the Meta Creator Breakthrough Program! $$, 'email', true,
  1, 3, 1, 'db68c27d-f0cf-49f4-8cf0-954220e9f14e', '2025-04-10T19:46:20.664508', '9ab55f79-6e2f-4b99-a842-d6a9e01c78cc'
);

INSERT INTO public.notification_settings (
  id, type, subject, message, channel, enabled, delay_days, frequency_days,
  max_notifications, stage_id, created_at, template_id
) VALUES (
  '44a3db29-34b4-46c0-8f0e-0c6ffb9fa967', 'reminder', 'Still incomplete! Act now', $$ Hi {full_name},<br><br>You haven’t finished onboarding yet. <br>Click <a href="{{url}}">here</a> to continue and secure your spot. $$, 'email', true,
  4, 3, 1, 'db68c27d-f0cf-49f4-8cf0-954220e9f14e', '2025-04-10T19:46:20.664508', '9ab55f79-6e2f-4b99-a842-d6a9e01c78cc'
);

INSERT INTO public.notification_settings (
  id, type, subject, message, channel, enabled, delay_days, frequency_days,
  max_notifications, stage_id, created_at, template_id
) VALUES (
  '5474ec13-87b2-4308-a52a-208d7845af1a', 'reminder', 'Last chance—finish your setup', $$ Hi {full_name},<br><br>Final reminder to complete your onboarding! <br><a href="{{url}}">Click here</a> before your spot is gone. $$, 'email', true,
  7, 3, 1, 'db68c27d-f0cf-49f4-8cf0-954220e9f14e', '2025-04-10T19:46:20.664508', '9ab55f79-6e2f-4b99-a842-d6a9e01c78cc'
);

INSERT INTO public.notification_settings (
  id, type, subject, message, channel, enabled, delay_days, frequency_days,
  max_notifications, stage_id, created_at, template_id
) VALUES (
  '417e9ef2-8f9c-4eb3-8eb3-cedbff31526e', 'reminder', 'Your spot is reserved! Finish onboarding', $$ Hi {full_name},<br><br>You're halfway there! Only 2 steps left.<br><br>Continue <a href="{{url}}">here</a> to finish your profile. $$, 'email', true,
  1, 3, 1, 'd4372ddc-b14c-48d0-bd4e-928d08fd4c91', '2025-04-10T19:46:20.664508', '9ab55f79-6e2f-4b99-a842-d6a9e01c78cc'
);

INSERT INTO public.notification_settings (
  id, type, subject, message, channel, enabled, delay_days, frequency_days,
  max_notifications, stage_id, created_at, template_id
) VALUES (
  'a59ae102-74d6-4131-9204-2c212fb76afd', 'reminder', 'Still incomplete! Act now', $$ Hi {full_name},<br><br>Reminder: just 2 steps away from completing your onboarding.<br><br><a href="{{url}}">Complete your profile now</a>. $$, 'email', true,
  4, 3, 1, 'd4372ddc-b14c-48d0-bd4e-928d08fd4c91', '2025-04-10T19:46:20.664508', '9ab55f79-6e2f-4b99-a842-d6a9e01c78cc'
);

INSERT INTO public.notification_settings (
  id, type, subject, message, channel, enabled, delay_days, frequency_days,
  max_notifications, stage_id, created_at, template_id
) VALUES (
  'af4d3d14-b197-45f2-9ddb-0491e6f7d180', 'reminder', 'Last chance—finish your setup', $$ Hi {full_name},<br><br>Don’t stop now — 2 steps left to unlock your Meta bonus.<br><br><a href="{{url}}">Finish onboarding today</a>. $$, 'email', true,
  7, 3, 1, 'd4372ddc-b14c-48d0-bd4e-928d08fd4c91', '2025-04-10T19:46:20.664508', '9ab55f79-6e2f-4b99-a842-d6a9e01c78cc'
);

INSERT INTO public.notification_settings (
  id, type, subject, message, channel, enabled, delay_days, frequency_days,
  max_notifications, stage_id, created_at, template_id
) VALUES (
  '5c352adc-5b71-4480-9d72-362fdd561eea', 'reminder', 'Your spot is reserved! Finish onboarding', $$ Hi {full_name},<br><br>You're almost done! Just 1 step left.<br><br><a href="{{url}}">Complete it here</a> to finalize your onboarding. $$, 'email', true,
  1, 3, 1, '462b4ad5-9fd5-4404-a700-f46f440ef75e', '2025-04-10T19:46:20.664508', '9ab55f79-6e2f-4b99-a842-d6a9e01c78cc'
);

INSERT INTO public.notification_settings (
  id, type, subject, message, channel, enabled, delay_days, frequency_days,
  max_notifications, stage_id, created_at, template_id
) VALUES (
  'dc7bad5f-1d7f-4863-8bf4-fa48e5b0c80b', 'reminder', 'Still incomplete! Act now', $$ Hi {full_name},<br><br>Only 1 final step before you can activate your Meta Creator bonus.<br><br><a href="{{url}}">Finish here</a>. $$, 'email', true,
  4, 3, 1, '462b4ad5-9fd5-4404-a700-f46f440ef75e', '2025-04-10T19:46:20.664508', '9ab55f79-6e2f-4b99-a842-d6a9e01c78cc'
);

INSERT INTO public.notification_settings (
  id, type, subject, message, channel, enabled, delay_days, frequency_days,
  max_notifications, stage_id, created_at, template_id
) VALUES (
  'e0c37fb9-c12f-4422-a77f-03be881f2cfc', 'reminder', 'Last chance—finish your setup', $$ Hi {full_name},<br><br>Last step! Don’t miss your chance.<br><br><a href="{{url}}">Complete setup</a> and join the program. $$, 'email', true,
  7, 3, 1, '462b4ad5-9fd5-4404-a700-f46f440ef75e', '2025-04-10T19:46:20.664508', '9ab55f79-6e2f-4b99-a842-d6a9e01c78cc'
);

INSERT INTO public.notification_settings (
  id, type, subject, message, channel, enabled, delay_days, frequency_days,
  max_notifications, stage_id, created_at
) VALUES (
  'aeeca798-8609-4ddb-8a88-d8ba59c260e3', 'reminder', NULL, $$ Hi {{full_name}}, your spot is still reserved! Complete onboarding: {{url}} $$, 'sms', true,
  1, 3, 1, 'db68c27d-f0cf-49f4-8cf0-954220e9f14e', '2025-04-10T20:57:30.692154'
);

INSERT INTO public.notification_settings (
  id, type, subject, message, channel, enabled, delay_days, frequency_days,
  max_notifications, stage_id, created_at
) VALUES (
  'd2af0480-600f-49d8-a002-d3f465a62b62', 'reminder', NULL, $$ Reminder: You haven’t finished onboarding. Do it now: {{url}} $$, 'sms', true,
  4, 3, 1, 'db68c27d-f0cf-49f4-8cf0-954220e9f14e', '2025-04-10T20:57:30.692154'
);

INSERT INTO public.notification_settings (
  id, type, subject, message, channel, enabled, delay_days, frequency_days,
  max_notifications, stage_id, created_at
) VALUES (
  'deb322af-ea5b-4bd9-a92c-bbadce553f11', 'reminder', NULL, $$ Final reminder! Complete setup now and secure your Meta bonus: {{url}} $$, 'sms', true,
  7, 3, 1, 'db68c27d-f0cf-49f4-8cf0-954220e9f14e', '2025-04-10T20:57:30.692154'
);
