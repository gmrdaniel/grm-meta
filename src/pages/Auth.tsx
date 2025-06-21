
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthContainer } from "@/components/auth/AuthContainer";
import { PasswordRecoveryDialog } from "@/components/auth/PasswordRecoveryDialog";
import { LoadingSpinner } from "@/components/auth/LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Auth() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [processingAuth, setProcessingAuth] = useState(false);

  useEffect(() => {
    // Check if this is a redirect from a magic link
    const handleHashParams = async () => {
      setProcessingAuth(true);
      try {
        // Check for hash fragments from redirects
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        
        console.log("Auth check - hash parameters:", { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken, 
          type 
        });

        if (accessToken && type === 'recovery') {
          // Handle password recovery redirect
          navigate('/auth', { replace: true });
          setIsRecoveryOpen(true);
          toast.info("Please set a new password");
          
        } else if (accessToken && refreshToken) {
          // Handle magic link login
          try {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) throw error;
            
            console.log("Magic link session set successfully", data);
            toast.success("Logged in successfully!");
            
            // Clean up the URL
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch (error) {
            console.error("Error setting session from magic link:", error);
            toast.error("Failed to authenticate with magic link");
          }
        }
      } catch (error) {
        console.error("Error processing authentication redirect:", error);
        toast.error("Failed to process authentication");
      } finally {
        setProcessingAuth(false);
      }
    };

    if (!loading) {
      handleHashParams();
    }
  }, [loading, navigate]);

  useEffect(() => {
    if (session && !loading && !processingAuth) {
      console.log("User already logged in, redirecting");
      const checkUserRole = async () => {
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user?.id)
            .single();
          
          if (profileError) {
            console.error("Profile error:", profileError);
            throw profileError;
          }
          
          console.log("Profile data:", profileData);

          if (profileData.role === 'creator') {
            navigate('/creator/dashboard');
          } else if (profileData.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            console.error("Invalid role:", profileData.role);
          }
        } catch (error) {
          console.error("Error checking user role:", error);
        }
      };
      
      checkUserRole();
    }
  }, [session, loading, navigate, processingAuth]);

  if (loading || processingAuth) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <AuthContainer 
        title={isLogin ? "Login" : "Create your account"}
        subtitle={isLogin 
          ? "Enter your credentials or use magic link to access your account" 
          : "Sign up to get started"
        }
      >
        <AuthForm 
          isLogin={isLogin}
          setIsLogin={setIsLogin}
          setIsRecoveryOpen={setIsRecoveryOpen}
        />
      </AuthContainer>

      <PasswordRecoveryDialog 
        isOpen={isRecoveryOpen}
        onOpenChange={setIsRecoveryOpen}
      />
    </>
  );
}