
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus, Mail } from "lucide-react";
import { CreatorsTable } from "@/components/creators/CreatorsTable";
import { AddCreatorForm } from "@/components/creators/AddCreatorForm";
import { InviteCreatorForm } from "@/components/creators/InviteCreatorForm";

interface Creator {
  id: string;
  created_at: string;
  role: string;
  personal_data?: {
    first_name: string | null;
    last_name: string | null;
    instagram_username: string | null;
  };
}

export default function Creators() {
  const [creators, setCreators] = useState<Creator[]>([]);

  useEffect(() => {
    fetchCreators();
  }, []);

  async function fetchCreators() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          created_at,
          role,
          personal_data (
            first_name,
            last_name,
            instagram_username
          )
        `)
        .eq("role", "creator");

      if (error) throw error;
      setCreators(data || []);
    } catch (error: any) {
      toast.error("Error fetching creators");
      console.error("Error:", error.message);
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Manage Creators</h1>

            <Tabs defaultValue="list" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Creators List
                </TabsTrigger>
                <TabsTrigger value="add" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add New Creator
                </TabsTrigger>
                <TabsTrigger value="invite" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Invite Creator
                </TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="mt-0">
                <CreatorsTable creators={creators} />
              </TabsContent>

              <TabsContent value="add" className="mt-0">
                <AddCreatorForm onCreatorAdded={fetchCreators} />
              </TabsContent>

              <TabsContent value="invite" className="mt-0">
                <InviteCreatorForm onInviteSent={fetchCreators} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
