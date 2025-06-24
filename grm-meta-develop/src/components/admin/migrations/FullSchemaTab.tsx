
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface FullSchemaTabProps {
  script: string;
  onCopy: (text: string) => void;
  onDownload: (content: string, filename: string) => void;
}

const FullSchemaTab = ({ script, onCopy, onDownload }: FullSchemaTabProps) => {
  if (!script) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Click "Export Schema" to generate the full database schema
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="flex gap-2 justify-end">
        <Button 
          variant="outline" 
          onClick={() => onCopy(script)}
        >
          Copy
        </Button>
        <Button 
          onClick={() => onDownload(script, 'full-schema.sql')}
        >
          Download SQL
        </Button>
      </div>
      <Textarea 
        value={script} 
        readOnly 
        className="font-mono h-[500px] overflow-y-auto"
      />
    </>
  );
};

export default FullSchemaTab;
