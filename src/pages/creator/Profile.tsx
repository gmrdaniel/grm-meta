
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { PersonalInfoCard } from "@/components/creator/PersonalInfoCard";

export default function CreatorProfile() {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const [isLoading, setIsLoading] = useState(false);
  console.log(user)
  return (
    <div className="flex h-screen bg-gray-50/50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className={cn("flex-1 overflow-y-auto p-6", isMobile && "pb-20")}>
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-800">Mi Perfil</h1>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <Card className="overflow-hidden">
                <PersonalInfoCard isLoading={isLoading} />
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
