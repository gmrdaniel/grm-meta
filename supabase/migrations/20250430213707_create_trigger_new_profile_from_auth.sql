CREATE TRIGGER on_profile_insert
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_profile_from_auth();
