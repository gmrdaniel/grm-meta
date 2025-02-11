
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus } from "lucide-react";

interface Profile {
  id: string;
  created_at: string;
  role: 'creator' | 'admin';
  email?: string;
}

export default function Creators() {
  const [loading, setLoading] = useState(false);
  const [creators, setCreators] = useState<Profile[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Fetch creators on component mount
  useEffect(() => {
    fetchCreators();
  }, []);

  async function fetchCreators() {
    try {
      // Get all profiles with role = creator
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "creator")
        .returns<Profile[]>();

      if (profilesError) throw profilesError;

      // Get all users
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
      if (usersError) throw usersError;

      // Combine profiles with user emails
      const creatorsWithEmails = (profiles || []).map((profile) => {
        const user = users.find((u) => u.id === profile.id);
        return {
          ...profile,
          email: user?.email,
        };
      });

      setCreators(creatorsWithEmails);
    } catch (error: any) {
      toast.error("Error fetching creators");
      console.error("Error:", error.message);
    }
  }

  async function handleAddCreator(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      // Sign up the creator
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Update their role to creator
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ role: "creator" })
        .eq("id", authData.user?.id);

      if (updateError) throw updateError;

      toast.success("Creator added successfully!");
      setEmail("");
      setPassword("");
      fetchCreators(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
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
                  Creators List ({creators.length})
                </TabsTrigger>
                <TabsTrigger value="add" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add New Creator
                </TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="mt-0">
                <div className="bg-white rounded-lg shadow">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Created At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {creators.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4">
                            No creators found
                          </TableCell>
                        </TableRow>
                      ) : (
                        creators.map((creator) => (
                          <TableRow key={creator.id}>
                            <TableCell>{creator.email}</TableCell>
                            <TableCell>{creator.role}</TableCell>
                            <TableCell>
                              {new Date(creator.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="add" className="mt-0">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-4">Add New Creator</h2>
                  <form onSubmit={handleAddCreator} className="space-y-4">
                    <div>
                      <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Adding..." : "Add Creator"}
                    </Button>
                  </form>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
