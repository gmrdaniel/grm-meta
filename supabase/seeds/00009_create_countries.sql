INSERT INTO public.countries (id, iso2, iso3, name_es, name_en, phone_code)
VALUES
('be1e04cb-bb0f-41fc-9b64-1e82d08461a5', 'MX', 'MEX', 'México', 'Mexico', '52'),
('4c3b2f80-88b5-42a5-8aa6-d75856cfbe94', 'CO', 'COL', 'Colombia', 'Colombia', '57'),
('f4a8379e-9631-44d3-805d-20345bfa3e43', 'AR', 'ARG', 'Argentina', 'Argentina', '54'),
('6ebc60ab-0896-4bc7-9532-2ad98e44ea72', 'CL', 'CHL', 'Chile', 'Chile', '56'),
('0b08f1b4-1d79-4e2d-8e88-c19b14c445b5', 'PE', 'PER', 'Perú', 'Peru', '51'),
('e504963e-6bb1-4b91-9f7d-927f75f451b8', 'US', 'USA', 'Estados Unidos', 'United States', '1')
ON CONFLICT (iso2) DO NOTHING;
