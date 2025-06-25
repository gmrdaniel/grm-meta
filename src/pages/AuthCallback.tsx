import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleLogin = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (session) {
        const params = new URLSearchParams(location.search);
        const next = params.get("next");

        if (next) {
          navigate(next);
        } else {
          navigate("/creator/dashboard"); 
        }
      } else {
        console.error("Error retrieving session after magic link:", error);
        navigate("/auth");
      }
    };

    handleLogin();
  }, [navigate, location.search]);

  return <div>Logging you in...</div>;
};

export default AuthCallback;