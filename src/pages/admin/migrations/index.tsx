
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  exportDatabaseSchema, 
  getUpdateStagesOrderFunctionSQL, 
  generateMigrationScripts 
} from "@/services/migrationService";
import ActionCards from "@/components/admin/migrations/ActionCards";
import FullSchemaTab from "@/components/admin/migrations/FullSchemaTab";
import TableMigrationsTab from "@/components/admin/migrations/TableMigrationsTab";
import FunctionsTab from "@/components/admin/migrations/FunctionsTab";

const DatabaseMigrations = () => {
  const [loading, setLoading] = useState(false);
  const [fullScript, setFullScript] = useState('');
  const [individualScripts, setIndividualScripts] = useState<{ tableName: string; script: string }[]>([]);
  const [functionScript, setFunctionScript] = useState('');

  const handleExportFullSchema = async () => {
    try {
      setLoading(true);
      const script = await exportDatabaseSchema();
      setFullScript(script);
      toast.success('Database schema exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export database schema');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMigrations = async () => {
    try {
      setLoading(true);
      const migrations = await generateMigrationScripts();
      setIndividualScripts(migrations);
      toast.success('Migrations generated successfully');
    } catch (error) {
      console.error('Migration generation failed:', error);
      toast.error('Failed to generate migrations');
    } finally {
      setLoading(false);
    }
  };

  const handleGetFunctionSQL = () => {
    const sql = getUpdateStagesOrderFunctionSQL();
    setFunctionScript(sql);
    toast.success('Function SQL generated successfully');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Copied to clipboard'))
      .catch((err) => toast.error('Failed to copy: ' + err));
  };

  const downloadAsFile = (content: string, filename: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Database Migrations</h1>
      
      <ActionCards 
        loading={loading}
        onExportFullSchema={handleExportFullSchema}
        onGenerateMigrations={handleGenerateMigrations}
        onGetFunctionSQL={handleGetFunctionSQL}
      />
      
      <Tabs defaultValue="full-schema" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="full-schema">Full Schema</TabsTrigger>
          <TabsTrigger value="individual-tables">Individual Tables</TabsTrigger>
          <TabsTrigger value="functions">Functions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="full-schema" className="space-y-4">
          <FullSchemaTab 
            script={fullScript} 
            onCopy={copyToClipboard}
            onDownload={downloadAsFile}
          />
        </TabsContent>
        
        <TabsContent value="individual-tables">
          <TableMigrationsTab 
            scripts={individualScripts}
            onCopy={copyToClipboard}
            onDownload={downloadAsFile}
          />
        </TabsContent>
        
        <TabsContent value="functions">
          <FunctionsTab 
            script={functionScript}
            onCopy={copyToClipboard}
            onDownload={downloadAsFile}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DatabaseMigrations;
