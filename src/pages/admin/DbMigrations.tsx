
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/Spinner";
import { NewMigrationForm } from "@/components/migrations/NewMigrationForm";
import { MigrationsList } from "@/components/migrations/MigrationsList";
import { toast } from "@/components/ui/use-toast";

export default function DbMigrations() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [migrations, setMigrations] = useState<any[]>([]);
  const [environment, setEnvironment] = useState<string>("development");

  useEffect(() => {
    if (user) {
      fetchMigrations();
    }
  }, [user, environment]);

  const fetchMigrations = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('db_migrations')
        .select('*')
        .eq('environment', environment)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      setMigrations(data || []);
    } catch (error: any) {
      console.error('Error fetching migrations:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load database migrations.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewMigration = async () => {
    await fetchMigrations();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto py-6">
            <h1 className="text-2xl font-bold mb-6">Database Migrations</h1>
            
            <Tabs defaultValue="migrations" className="space-y-4">
              <TabsList>
                <TabsTrigger value="migrations">Migrations</TabsTrigger>
                <TabsTrigger value="new">New Migration</TabsTrigger>
              </TabsList>
              
              <TabsContent value="migrations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Database Migrations</CardTitle>
                    <CardDescription>
                      Track all database changes for replication between environments.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <select 
                        className="w-full max-w-xs p-2 border rounded" 
                        value={environment}
                        onChange={(e) => setEnvironment(e.target.value)}
                      >
                        <option value="development">Development</option>
                        <option value="production">Production</option>
                      </select>
                    </div>
                    
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <Spinner size="lg" />
                      </div>
                    ) : (
                      <MigrationsList 
                        migrations={migrations} 
                        onRefresh={fetchMigrations} 
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="new">
                <Card>
                  <CardHeader>
                    <CardTitle>New Migration</CardTitle>
                    <CardDescription>
                      Record a new database migration.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <NewMigrationForm 
                      onSuccess={handleNewMigration} 
                      currentEnvironment={environment}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
