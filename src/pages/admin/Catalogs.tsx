
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

const Catalogs = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Catálogos" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Catálogos del Sistema</h2>
              <p className="text-gray-500">
                En esta sección podrás administrar los diferentes catálogos del sistema.
              </p>
              
              {/* Placeholder for catalog content - to be implemented */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-medium">Categorías</h3>
                  <p className="text-sm text-gray-500 mt-1">Administrar categorías de servicios</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-medium">Plataformas</h3>
                  <p className="text-sm text-gray-500 mt-1">Administrar plataformas sociales</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-medium">Tipos de Contenido</h3>
                  <p className="text-sm text-gray-500 mt-1">Administrar tipos de contenido</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Catalogs;
