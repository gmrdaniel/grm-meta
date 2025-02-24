
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostTypesTab } from "@/components/post-types/types/PostTypesTab";
import { PlatformsTab } from "@/components/post-types/platform/PlatformsTab";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";

export default function PostTypes() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Tabs defaultValue="platforms">
              <div className="flex justify-between items-center mb-6">
                <TabsList>
                  <TabsTrigger value="platforms">Redes Sociales</TabsTrigger>
                  <TabsTrigger value="postTypes">Tipos de Publicación</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="platforms">
                <PlatformsTab />
              </TabsContent>

              <TabsContent value="postTypes">
                <PostTypesTab />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
