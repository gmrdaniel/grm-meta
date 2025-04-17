CREATE OR REPLACE FUNCTION copy_invitation_to_profile()
RETURNS TRIGGER AS $$
DECLARE
  invited public.creator_invitations%ROWTYPE;
  names TEXT[];
BEGIN
  -- Buscar invitación con el mismo email
  SELECT * INTO invited
  FROM public.creator_invitations
  WHERE email = NEW.email
  ORDER BY created_at DESC
  LIMIT 1;

  IF FOUND THEN
    -- Si la invitación ya tiene first_name y last_name separados
    IF invited.first_name IS NOT NULL THEN
      NEW.first_name := invited.first_name;
      NEW.last_name := invited.last_name;
    -- Si todavía tiene full_name (dato legacy)
    ELSIF invited.full_name IS NOT NULL THEN
      names := string_to_array(invited.full_name, ' ');

      IF array_length(names, 1) >= 1 THEN
        NEW.first_name := names[1];

        IF array_length(names, 1) > 1 THEN
          NEW.last_name := array_to_string(names[2:], ' ');
        END IF;
      END IF;
    END IF;

    -- Copiar otros campos si existen
    NEW.role := invited.role;
    NEW.profile_photo_url := invited.profile_photo_url;
    NEW.meta_verified := invited.meta_verified;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
