
import { useState, useEffect } from "react";
import { supabase, testSupabaseConnection } from "@/integrations/supabase/client";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";

export default function Auth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{success?: boolean, message: string}>({ message: "Checking connection..." });
  const { user, session, authError } = useAuth();

  useEffect(() => {
    // Verificar la conexión a Supabase al cargar
    const checkConnection = async () => {
      try {
        console.log("Verifying Supabase connection...");
        const result = await testSupabaseConnection();
        setConnectionStatus({ 
          success: result.success, 
          message: result.message 
        });
        
        if (!result.success) {
          console.error("Connection failed:", result.message);
        }
      } catch (err) {
        console.error("Error testing connection:", err);
        setConnectionStatus({ 
          success: false, 
          message: `Error al comprobar la conexión: ${err instanceof Error ? err.message : String(err)}` 
        });
      }
    };
    
    checkConnection();
  }, []);

  // Display auth errors from the useAuth hook
  useEffect(() => {
    if (authError) {
      console.error("Auth error from hook:", authError);
      toast({
        variant: "destructive",
        title: "Error de autenticación",
        description: authError.message || "Ocurrió un error durante la autenticación",
      });
    }
  }, [authError]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      console.log(`Attempting login for: ${email}`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        throw error;
      }
      
      console.log("Login successful:", data.user?.id);
      navigate("/");
    } catch (error: any) {
      console.error("Login error details:", error);
      toast({
        variant: "destructive",
        title: "Error de inicio de sesión",
        description: error.message || "No se pudo iniciar sesión",
      });
    } finally {
      setLoading(false);
    }
  };

  // Redireccionar si ya está autenticado
  if (user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Logo en la esquina superior derecha */}
      <div className="absolute top-4 right-4">
        <img 
          src="/lovable-uploads/15012b70-aa4e-4950-b985-f3dc21b231b5.png" 
          alt="LA NETA Logo" 
          className="h-12" 
        />
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Iniciar Sesión</h1>
            <p className="text-gray-600">Bienvenido al panel de administración</p>
            
            {/* Indicador de estado de conexión */}
            <div className={`mt-2 text-sm ${connectionStatus.success ? 'text-green-600' : connectionStatus.success === false ? 'text-red-600' : 'text-yellow-600'}`}>
              {connectionStatus.message}
            </div>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
                placeholder="tu@email.com"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
          
          {/* Debug information */}
          <div className="mt-4 text-xs text-center text-gray-500">
            <p>Ambiente: {import.meta.env.VITE_APP_ENV || 'development'}</p>
            <p>Session: {session ? "Active" : "None"}</p>
            <p>Auth Status: {loading ? "Loading" : user ? "Authenticated" : "Not authenticated"}</p>
          </div>
        </div>
      </div>
      
      {/* Footer con el texto de copyright */}
      <div className="py-4 text-center text-gray-600 text-sm">
        © 2025 LA NETA from Global Media Review
      </div>
    </div>
  );
}
