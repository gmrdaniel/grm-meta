
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { StatsCard } from "@/components/StatsCard";
import { Image, Star, Heart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CreatorDashboard() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Panel del Creador</h1>
            
            <Tabs defaultValue="profile" className="w-full">
              <TabsList>
                <TabsTrigger value="profile">Perfil</TabsTrigger>
                <TabsTrigger value="banking">Datos Bancarios</TabsTrigger>
                <TabsTrigger value="campaigns">Mis Campañas</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                  <StatsCard
                    title="Contenido Creado"
                    value="156"
                    description="Total de piezas creadas"
                    icon={<Image size={20} />}
                    trend="up"
                    trendValue="+15.5%"
                  />
                  <StatsCard
                    title="Calificación Promedio"
                    value="4.8"
                    description="De reseñas de usuarios"
                    icon={<Star size={20} />}
                    trend="up"
                    trendValue="+0.3"
                  />
                  <StatsCard
                    title="Me gusta"
                    value="2,341"
                    description="Total de me gusta"
                    icon={<Heart size={20} />}
                    trend="up"
                    trendValue="+22.4%"
                  />
                </div>
              </TabsContent>

              <TabsContent value="banking">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-4">Información Bancaria</h2>
                  <p className="text-gray-600">Configure sus datos bancarios para recibir pagos</p>
                </div>
              </TabsContent>

              <TabsContent value="campaigns">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-4">Mis Campañas</h2>
                  <p className="text-gray-600">Gestione sus campañas activas</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
