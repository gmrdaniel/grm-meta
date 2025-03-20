
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface AuthFormProps {
  isLogin: boolean;
  setIsLogin: (isLogin: boolean) => void;
  setIsRecoveryOpen: (isOpen: boolean) => void;
}

export function AuthForm({ isLogin, setIsLogin, setIsRecoveryOpen }: AuthFormProps) {
  const navigate = useNavigate();
  const [authLoading, setAuthLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAuthLoading(true);
    
    try {
      if (isLogin) {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (authError) throw authError;
        console.log("Auth successful:", authData);

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user?.id)
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
          throw new Error(`Invalid role: ${profileData.role}`);
        }

      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Check your email for the confirmation link!");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "An error occurred during authentication");
    } finally {
      setAuthLoading(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="email" className="block text-sm font-medium">Email</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full"
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="password" className="block text-sm font-medium">Password</Label>
          {isLogin && (
            <button
              type="button"
              onClick={() => setIsRecoveryOpen(true)}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Forgot password?
            </button>
          )}
        </div>
        <Input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          minLength={6}
          className="w-full"
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={authLoading}
      >
        {authLoading ? "Loading..." : (isLogin ? "Sign in" : "Sign up")}
      </Button>

      <div className="text-center text-sm">
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-600 hover:text-blue-500 font-medium"
        >
          {isLogin
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </form>
  );
}
