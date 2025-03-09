
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Network, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Catalogs = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Catálogos del Sistema</h2>
              <p className="text-gray-500 mb-6">
                En esta sección podrás administrar los diferentes catálogos del sistema.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {/* Administrar Servicios Card */}
                <Card className="hover:shadow-md transition-shadow border border-gray-200">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Administrar Servicios</CardTitle>
                      <Settings className="text-gray-500 h-5 w-5" />
                    </div>
                    <CardDescription>
                      Gestiona los servicios disponibles en el sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-gray-500">
                      Agrega, edita y elimina los servicios que ofrece la plataforma.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full mt-2" 
                      onClick={() => navigate('/admin/services')}
                    >
                      Ir a Servicios
                    </Button>
                  </CardFooter>
                </Card>

                {/* Categorías Card */}
                <Card className="hover:shadow-md transition-shadow border border-gray-200">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Categorías</CardTitle>
                      <Tag className="text-gray-500 h-5 w-5" />
                    </div>
                    <CardDescription>
                      Administra las categorías de creadores
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-gray-500">
                      Gestiona las categorías para clasificar a los creadores.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full mt-2" 
                      onClick={() => navigate('/admin/categories')}
                    >
                      Ir a Categorías
                    </Button>
                  </CardFooter>
                </Card>

                {/* Redes Sociales Card */}
                <Card className="hover:shadow-md transition-shadow border border-gray-200">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Redes Sociales</CardTitle>
                      <Network className="text-gray-500 h-5 w-5" />
                    </div>
                    <CardDescription>
                      Administra las plataformas y tipos de publicación
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-gray-500">
                      Configura las redes sociales y los tipos de contenido disponibles.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full mt-2" 
                      onClick={() => navigate('/admin/post-types')}
                    >
                      Ir a Redes Sociales
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Catalogs;
