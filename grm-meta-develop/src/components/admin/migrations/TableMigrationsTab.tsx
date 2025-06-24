
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface TableScript {
  tableName: string;
  script: string;
}

interface TableMigrationsTabProps {
  scripts: TableScript[];
  onCopy: (text: string) => void;
  onDownload: (content: string, filename: string) => void;
}

const TableMigrationsTab = ({ scripts, onCopy, onDownload }: TableMigrationsTabProps) => {
  if (scripts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Click "Generate Migrations" to see individual table scripts
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {scripts.map((script, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{script.tableName}</CardTitle>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onCopy(script.script)}
              >
                Copy
              </Button>
              <Button 
                size="sm"
                onClick={() => onDownload(script.script, `${script.tableName}.sql`)}
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
  );
};

export default TableMigrationsTab;
