
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddCreatorFormProps {
  onCreatorAdded: () => void;
}

export function AddCreatorForm({ onCreatorAdded }: AddCreatorFormProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleAddCreator(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: 'creator' }
      });

      if (createError) throw createError;
      if (!user) throw new Error("No user data returned");

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ role: "creator" })
        .eq("id", user.id);

      if (profileError) throw profileError;

      toast.success("Creator added successfully!");
      setEmail("");
      setPassword("");
      onCreatorAdded();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
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
  );
}
