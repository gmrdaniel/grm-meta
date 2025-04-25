ALTER TABLE profiles
ADD COLUMN country_of_residence_id UUID REFERENCES countries(id) ON DELETE SET NULL;