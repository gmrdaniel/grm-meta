
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // Function to determine if user is trying to access admin path
  const isAdminPath = () => location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
        <h1 className="text-6xl font-bold mb-4 text-red-500">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! La página que buscas no existe</p>
        <p className="text-gray-500 mb-6">
          La ruta <span className="font-mono bg-gray-100 px-2 py-1 rounded">{location.pathname}</span> no fue encontrada.
        </p>
        <div className="space-y-3">
          <Button 
            className="w-full" 
            onClick={() => navigate('/')}
          >
            Volver al Inicio
          </Button>
          
          {isAdminPath() && (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate('/admin/dashboard')}
            >
              Ir al Dashboard de Admin
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
