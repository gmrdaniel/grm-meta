-- Crear la función que copia datos desde auth.users.raw_user_meta_data a public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_profile_from_auth()
RETURNS TRIGGER AS $$
DECLARE
  user_metadata JSONB;
BEGIN
  -- Obtener los metadatos del usuario desde auth.users
  SELECT raw_user_meta_data INTO user_metadata
  FROM auth.users
  WHERE id = NEW.id;

  -- Asignar campos si existen en los metadatos
  IF user_metadata IS NOT NULL THEN
    NEW.first_name := COALESCE(user_metadata->>'first_name', NEW.first_name);
    NEW.last_name := COALESCE(user_metadata->>'last_name', NEW.last_name);
    NEW.phone_country_code := user_metadata->>'phone_country_code';
    NEW.phone_number := user_metadata->>'phone_number';
    /* NEW.social_media_handle := user_metadata->>'social_media_handle'; */
    NEW.country_of_residence_id := user_metadata->>'country_of_residence_id';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
