-- Países faltantes en el seed original
INSERT INTO public.countries (id, iso2, iso3, name_es, name_en, phone_code)
VALUES
('3fc5c208-fac3-4f13-94dc-92ae60be0c01', 'BO', 'BOL', 'Bolivia', 'Bolivia', '591'),
('0f2a942a-5e36-4325-80f3-1ae6c9c11b87', 'CR', 'CRI', 'Costa Rica', 'Costa Rica', '506'),
('b118be03-0501-4211-81e1-d362c612bc8c', 'EC', 'ECU', 'Ecuador', 'Ecuador', '593'),
('8e2a2d65-2303-4644-996d-88c289e91db5', 'SV', 'SLV', 'El Salvador', 'El Salvador', '503'),
('e7d6b9c1-8ff6-4ec7-b87b-3a314a6d297f', 'GT', 'GTM', 'Guatemala', 'Guatemala', '502'),
('d1b34b59-e8bc-49aa-bc94-40cf6231db1d', 'HN', 'HND', 'Honduras', 'Honduras', '504'),
('4e5c9f16-6799-4307-9f3f-d0e9a0cb1c84', 'NI', 'NIC', 'Nicaragua', 'Nicaragua', '505'),
('624b9df2-82d9-404e-b7b2-e18dc3a5ee39', 'PA', 'PAN', 'Panamá', 'Panama', '507'),
('a67b7b2c-2b1b-44b4-93f2-9206a154bfc1', 'PY', 'PRY', 'Paraguay', 'Paraguay', '595'),
('d44d7583-c770-4a42-a7d7-219fd25e0a69', 'DO', 'DOM', 'República Dominicana', 'Dominican Republic', '1'),
('2f4d4434-771e-4958-a54e-e46c54e5652e', 'UY', 'URY', 'Uruguay', 'Uruguay', '598'),
('d72c2322-5865-470e-9e01-5c94b6d4a414', 'VE', 'VEN', 'Venezuela', 'Venezuela', '58')
ON CONFLICT (iso2) DO NOTHING;
