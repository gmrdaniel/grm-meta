
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  const { user } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      console.log("Intentando iniciar sesión con:", { email });
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Error de inicio de sesión:", error);
        throw error;
      }
      
      console.log("Inicio de sesión exitoso, redirigiendo...");
      navigate("/");
    } catch (error: any) {
      console.error("Error completo:", error);
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
    console.log("Usuario ya autenticado, redirigiendo a /");
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
        </div>
      </div>
      
      {/* Footer con el texto de copyright */}
      <div className="py-4 text-center text-gray-600 text-sm">
        © 2025 LA NETA from Global Media Review
      </div>
    </div>
  );
}
