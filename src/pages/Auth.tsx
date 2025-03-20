
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthContainer } from "@/components/auth/AuthContainer";
import { PasswordRecoveryDialog } from "@/components/auth/PasswordRecoveryDialog";
import { LoadingSpinner } from "@/components/auth/LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";

export default function Auth() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);

  useEffect(() => {
    if (session && !loading) {
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
  }, [session, loading, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <AuthContainer 
        title={isLogin ? "Login" : "Create your account"}
        subtitle={isLogin 
          ? "Enter your credentials to access your account" 
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
