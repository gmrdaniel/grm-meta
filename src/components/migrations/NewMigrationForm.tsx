
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/Spinner";

interface NewMigrationFormProps {
  onSuccess: () => void;
  currentEnvironment: string;
}

export function NewMigrationForm({ onSuccess, currentEnvironment }: NewMigrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    migrationName: "",
    description: "",
    sqlCommands: "",
    environment: currentEnvironment,
    version: "1.0.0"
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.migrationName || !formData.sqlCommands) {
      toast({
        variant: "destructive",
        title: "Required Fields",
        description: "Please fill out all required fields.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const { data, error } = await supabase.rpc('record_db_migration', {
        _migration_name: formData.migrationName,
        _description: formData.description,
        _sql_commands: formData.sqlCommands,
        _environment: formData.environment,
        _version: formData.version
      });

      if (error) throw error;

      toast({
        title: "Migration Recorded",
        description: "Database migration has been successfully recorded.",
      });
      
      // Reset form
      setFormData({
        migrationName: "",
        description: "",
        sqlCommands: "",
        environment: currentEnvironment,
        version: "1.0.0"
      });
      
      // Notify parent
      onSuccess();
      
    } catch (error: any) {
      console.error('Error recording migration:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to record migration.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="migrationName">Migration Name <span className="text-red-500">*</span></Label>
          <Input
            id="migrationName"
            name="migrationName"
            value={formData.migrationName}
            onChange={handleChange}
            placeholder="e.g., add_users_table"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="version">Version</Label>
          <Input
            id="version"
            name="version"
            value={formData.version}
            onChange={handleChange}
            placeholder="e.g., 1.0.0"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="environment">Environment</Label>
        <select
          id="environment"
          name="environment"
          value={formData.environment}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="development">Development</option>
          <option value="production">Production</option>
        </select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the purpose of this migration..."
          rows={2}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="sqlCommands">SQL Commands <span className="text-red-500">*</span></Label>
        <Textarea
          id="sqlCommands"
          name="sqlCommands"
          value={formData.sqlCommands}
          onChange={handleChange}
          placeholder="Enter the SQL commands..."
          rows={10}
          className="font-mono text-sm"
          required
        />
      </div>
      
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Spinner size="sm" className="mr-2" />
            Recording...
          </>
        ) : (
          "Record Migration"
        )}
      </Button>
    </form>
  );
}
