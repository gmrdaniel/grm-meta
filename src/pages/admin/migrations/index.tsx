
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { exportDatabaseSchema, getUpdateStagesOrderFunctionSQL, generateMigrationScripts } from "@/services/migrationService";
import { toast } from "sonner";

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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Full Schema Export</CardTitle>
            <CardDescription>Export the complete database schema as SQL</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={handleExportFullSchema} disabled={loading}>
              {loading ? 'Exporting...' : 'Export Schema'}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Table Migrations</CardTitle>
            <CardDescription>Generate individual table migration scripts</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={handleGenerateMigrations} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Migrations'}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Custom Functions</CardTitle>
            <CardDescription>Generate SQL for required database functions</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={handleGetFunctionSQL}>
              Get Function SQL
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Tabs defaultValue="full-schema" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="full-schema">Full Schema</TabsTrigger>
          <TabsTrigger value="individual-tables">Individual Tables</TabsTrigger>
          <TabsTrigger value="functions">Functions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="full-schema" className="space-y-4">
          {fullScript ? (
            <>
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => copyToClipboard(fullScript)}
                >
                  Copy
                </Button>
                <Button 
                  onClick={() => downloadAsFile(fullScript, 'full-schema.sql')}
                >
                  Download SQL
                </Button>
              </div>
              <Textarea 
                value={fullScript} 
                readOnly 
                className="font-mono h-[500px] overflow-y-auto"
              />
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Click "Export Schema" to generate the full database schema
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="individual-tables">
          {individualScripts.length > 0 ? (
            <div className="space-y-4">
              {individualScripts.map((script, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{script.tableName}</CardTitle>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => copyToClipboard(script.script)}
                      >
                        Copy
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => downloadAsFile(script.script, `${script.tableName}.sql`)}
                      >
                        Download
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Textarea 
                      value={script.script} 
                      readOnly 
                      className="font-mono h-[200px] overflow-y-auto"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Click "Generate Migrations" to see individual table scripts
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="functions">
          {functionScript ? (
            <>
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => copyToClipboard(functionScript)}
                >
                  Copy
                </Button>
                <Button 
                  onClick={() => downloadAsFile(functionScript, 'functions.sql')}
                >
                  Download SQL
                </Button>
              </div>
              <Textarea 
                value={functionScript} 
                readOnly 
                className="font-mono h-[300px] overflow-y-auto"
              />
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Click "Get Function SQL" to generate database function scripts
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DatabaseMigrations;
